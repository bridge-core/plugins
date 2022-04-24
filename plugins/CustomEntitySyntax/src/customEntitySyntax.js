module.exports = ({projectRoot, projectConfig, fileSystem}) => {
    const compare = require('compare-versions');
    const uuid = require('uuid');
    const uuidByString = require('uuid-by-string');

    function deepMerge(obj1, obj2) {
        let outArray = undefined
        if (Array.isArray(obj1) && Array.isArray(obj2)) outArray = obj1.concat(obj2)
        else if (Array.isArray(obj1)) outArray = obj1.concat([obj2])
        else if (Array.isArray(obj2)) outArray = obj2.concat([obj1])
        else if (typeof obj2 !== 'object') return obj2

        // Remove duplicates
        if (outArray) return [...new Set([...outArray])]

        let res = {}

        for (const key in obj1) {
            if (obj2[key] === undefined) res[key] = obj1[key]
            else res[key] = deepMerge(obj1[key], obj2[key])
        }

        for (const key in obj2) {
            if (obj1[key] === undefined) res[key] = obj2[key]
        }

        return res
    }

    function use(obj, path) {
        if (typeof path == 'string') path = path.split('/')
        const key = path.shift()

        if (path.length === 0) {
            let o = obj[key]
            if (obj[key] !== undefined) delete obj[key]
            return o
        }
        return use(obj[key], path)
    }

    function processEvent(eventObj, opts) {
        let entity = {}

        if (opts.eventName) {
            const res = processEvent(eventObj, { formatVersion : opts.formatVersion,path : opts.path })

            entity = deepMerge(entity, res.entity)
            entity = deepMerge(entity, {
                'minecraft:entity': { events: { [opts.eventName]: res.event } }
            })

            return entity
        } else if (eventObj) {
                // Sequence/Randomize support
                if (eventObj.sequence && Array.isArray(eventObj.sequence)) {
                    let sequencedEvents = []
                    for (const entry of eventObj.sequence) {
                        const nestedRes = processEvent(entry, { formatVersion : opts.formatVersion,path : opts.path })
                        entity = deepMerge(entity, nestedRes.entity['minecraft:entity'])
                        sequencedEvents.push(nestedRes.event)
                    }
                    eventObj.sequence = sequencedEvents
                } 
                if (eventObj.randomize && Array.isArray(eventObj.randomize)) {
                    let randomizedEvents = []
                    for (const entry of eventObj.randomize) {
                        const nestedRes = processEvent(entry, {formatVersion : opts.formatVersion,path : opts.path })
                        entity = deepMerge(entity, nestedRes.entity['minecraft:entity'])
                        randomizedEvents.push(nestedRes.event)
                    }
                    eventObj.randomize = randomizedEvents
                }

                // Spell effects
                const effectId = uuid.v4()
                let addEffects = undefined
                let removeEffects = undefined

                if (eventObj.add?.spell_effects) addEffects = use(eventObj, 'add/spell_effects')
                if (eventObj.remove?.spell_effects) removeEffects = use(eventObj, 'remove/spell_effects')

                if (addEffects) {
                    eventObj = deepMerge(eventObj, { add: { component_groups: [effectId] } })
                    entity = deepMerge(entity, {
                        component_groups: { [effectId]: { 'minecraft:spell_effects': { add_effects: addEffects } } }
                    })
                }
                if (removeEffects) {
                    eventObj = deepMerge(eventObj, { add: { component_groups: [effectId] } })
                    entity = deepMerge(entity, {
                        component_groups: { [effectId]: { 'minecraft:spell_effects': { remove_effects: removeEffects } } }
                    })
                }

                // Group
                if (eventObj.add?.group) {
                    const group = use(eventObj, 'add/group')
                    const groupName = (typeof group.name !== 'object' ? group.name : uuid.v4()) || uuid.v4()
                    const components = group.components ?? {}
    
                    eventObj = deepMerge(eventObj, {
                        add: { component_groups: [groupName] }
                    })
                    entity = deepMerge(entity, {
                        component_groups: { [groupName]: components }
                    })
                }
        
                // Execute commands
                if (eventObj.execute?.commands) {
                    let { commands } = use(eventObj, 'execute') ?? []
                    if (typeof commands == 'string') commands = [commands]
                    let canUseRunCommand = projectConfig.get().experimentalGameplay?.holidayCreatorFeatures && (compare(opts.formatVersion, '1.16.100', '>=') >= 0)
                    if (!canUseRunCommand) {
                        // < 1.16.100 & holidayCreatorFeatures
                        commandIdCounter++
                        let executeCommandsGroup = `execute_command_id_${commandIdCounter}`
    
                        entity = deepMerge(entity, { description: { animations: { [acShortName(opts.path)]: acId(opts.path) } } })
                        entity = deepMerge(entity, { description: { scripts: { animate: [acShortName(opts.path)] } } })
    
                        entity = deepMerge(entity, {
                            component_groups: { 
                                [`bridge:${executeCommandsGroup}`]: {
                                    'minecraft:skin_id': {
                                        value: commandIdCounter,
                                    },
                                } 
                            } 
                        })
                        entity = deepMerge(entity, {
                            component_groups: { 
                                'bridge:execute_no_command': {
                                    'minecraft:skin_id': {
                                        value: 0
                                    },
                                } 
                            } 
                        })
    
                        eventObj = deepMerge(eventObj, { add: { component_groups: [`bridge:${executeCommandsGroup}`] } })
                        entity = deepMerge(entity, { events: {
                            [`bridge:remove_command_id_${commandIdCounter}`]: {
                                add: {
                                    component_groups: ['bridge:execute_no_command'],
                                },
                                remove: {
                                    component_groups: [`bridge:${executeCommandsGroup}`],
                                },
                            }
                        }})
                        
                        acMap[acPath(opts.path)] = deepMerge(acMap[acPath(opts.path)], {
                            animation_controllers: {
                                [acId(opts.path)]: {
                                    states: {
                                        default: {
                                            transitions: [
                                                {
                                                    [executeCommandsGroup]: `query.skin_id == ${commandIdCounter}`,
                                                },
                                            ],
                                        },
                                        [executeCommandsGroup]: {
                                            transitions: [
                                                { default: `query.skin_id != ${commandIdCounter}` },
                                            ],
                                            on_entry: [
                                                ...commands,
                                                `@s bridge:remove_command_id_${commandIdCounter}`
                                            ]
                                        },
                                    }
                                }
                            }
                        })
                    } else {
                        // >= 1.16.100
                        eventObj = deepMerge(eventObj, { run_command: { command: commands } })
                    }
                }
                
                }
            return { 
                entity: { 'minecraft:entity': entity },
                event: eventObj
            }    
    }

    let acPathMap = undefined;
    let acMap = {};
    let animationControllerTemplate = JSON.stringify({
        format_version: '1.10.0',
        animation_controllers: {}
    });
    let commandIdCounter = 0
    const acPath = (path) => projectRoot + `/BP/animation_controllers/bridge/cmds_${uuidByString(path).substring(0,18)}.json`
    const acId = (path) =>`controller.animation.bridge.${uuidByString(path)}_execute_commands`
    const acShortName = (path) => `bridge_execute_command_${uuidByString(path)}`

    async function checkACPathMap()
    {   
        if(!acPathMap)
        {
            acPathMap = {};
            let entities = await fileSystem.allFiles(projectRoot + "/BP/entities");
            entities.forEach(e => acPathMap[acPath(e)] = e);
            return Array.from(entities, (path) => [acPath(path), {isVirtual : true}]);
        }
    }

    return {
        async include() {
            let res = await checkACPathMap();
            return res;
        },
        async require(filePath) {
            await checkACPathMap();
            if (acPathMap[filePath]) return [acPathMap[filePath]];
        },
        async read(filePath) {
            await checkACPathMap();
            if (acPathMap[filePath]) return JSON.parse(animationControllerTemplate);
        },
        async transform(filePath, fileContent) {
            await checkACPathMap();
            if (filePath.includes('BP/entities')) {

                const events = fileContent['minecraft:entity']?.events
                const formatVersion = fileContent?.format_version ?? '1.17.0'
                
                acMap[acPath(filePath)] = JSON.parse(animationControllerTemplate);
                // Iterate each event and process it
                for (const event in events) {
                    const res = processEvent(events[event], { formatVersion: formatVersion, eventName: event, path : filePath})

                    // Merge transformed entity with original
                    fileContent['minecraft:entity'].events[event] = {}
                    fileContent = deepMerge(fileContent, res)
                }

                commandIdCounter = 0

                return fileContent
            } else if (acPathMap[filePath]) {
                const data = deepMerge(acMap[filePath], fileContent)
                return data
            }
        },
        async finalizeBuild(filePath, fileContent) {
            await checkACPathMap();
            if (acPathMap[filePath])
            {
                if(JSON.stringify(fileContent) === animationControllerTemplate)
                    return null;
            }
        },
    }
}