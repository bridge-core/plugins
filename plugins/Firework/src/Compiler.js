import * as Backend from './Backend.js'
import * as Native from './Native.js'

/*
    Type Routes:

    Asignment -> Name | -> ?Expression

    Definition -> Name | -> Codeblock

    If -> ?Expression | -> Codeblock

    Delay -> Constant | -> Codeblock

    Codeblock -> Ifs / Delays / Assignments / Native Methods / Defined Methods

    Expression -> Name / Native Methods / Expression

    Call -> Name | -> Expression*
*/

export function Compile(tree, config, source){
    //#region NOTE: Setup json values for editing
    let worldRuntime = source

    let outAnimations = {}

    if(!worldRuntime['minecraft:entity'].description.animations){
        worldRuntime['minecraft:entity'].description.animations = {}
    }

    if(!worldRuntime['minecraft:entity'].description.properties){
        worldRuntime['minecraft:entity'].description.properties = {}
    }

    if(!worldRuntime['minecraft:entity'].events){
        worldRuntime['minecraft:entity'].events = {}
    }

    if(!worldRuntime['minecraft:entity'].description.scripts){
        worldRuntime['minecraft:entity'].description.scripts = {}
    }

    if(!worldRuntime['minecraft:entity'].description.scripts.animate){
        worldRuntime['minecraft:entity'].description.scripts.animate = []
    }
    //#endregion

    //#region NOTE: Static Value Init - Index Dynamic Flags
    let dynamicFlags = {}

    function searchForDyncamicFlags(tree){
        for(let i = 0; i < tree.length; i++){
            if(tree[i].token == 'ASSIGN'){
                if(tree[i].value[0].value == 'dyn' && tree[i].value[0].token == 'KEYWORD'){
                    if(dynamicFlags[tree[i].value[1].value]){
                        return new Backend.Error(`Dynamic flag '${tree[i].value[1].value}' already exists!`, tree[i].value[0].line)
                    }

                    if(tree[i].value[2].token != 'MOLANG'){
                        return new Backend.Error(`Dynamic flag '${tree[i].value[1].value}' can only be assigned to molang! It was assigned to '${tree[i].value[2].token}'.`, tree[i].value[0].line)
                    }

                    dynamicFlags[tree[i].value[1].value] = tree[i].value[2].value
                }
            }
        }
    }

    let deep = searchForDyncamicFlags(tree)

    if(deep instanceof Backend.Error){
        return deep
    }

    Native.setDynamicFlags(dynamicFlags)
    //#endregion

    //#region NOTE: Dynamic Value Init - Index Flags
    let flags = {}

    function indexFlag(name){
        flags[name] = {}
    }

    function searchForFlags(tree){
        if(tree.token == 'EXPRESSION'){
            for(let i = 0; i < tree.value.length; i++){
                if(tree.value[i].token == 'EXPRESSION'){
                    let deep = searchForFlags(tree.value[i])

                    if(deep instanceof Backend.Error){
                        return deep
                    }
                }else if(tree.value[i].token == 'FLAG'){
                    let deep = indexFlag(tree.value[i].value)

                    if(deep instanceof Backend.Error){
                        return deep
                    }
                }
            }
        }else{
            for(let i = 0; i < tree.length; i++){
                if(tree[i].token == 'ASSIGN'){
                    if(tree[i].value[0].token == 'FLAG'){
                        if(tree[i].value[1].token != 'BOOLEAN'){
                            return new Backend.Error(`fFlag '${tree[i].value[0].value}' can only be assigned to a boolean value! It was assigned to '${tree[i].value[1].token}'.`, tree[i].line)
                        }

                        let deep = indexFlag(tree[i].value[0].value)

                        if(deep instanceof Backend.Error){
                            return deep
                        }
                    }
                }else if(tree[i].token == 'DEFINITION'){
                    let deep = searchForFlags(tree[i].value[1].value)

                    if(deep instanceof Backend.Error){
                        return deep
                    }
                }else if(tree[i].token == 'IF'){
                    let deep = searchForFlags(tree[i].value[0])

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    deep = searchForFlags(tree[i].value[1].value)

                    if(deep instanceof Backend.Error){
                        return deep
                    }
                }else if(tree[i].token == 'DELAY'){
                    let deep = searchForFlags(tree[i].value[1].value)

                    if(deep instanceof Backend.Error){
                        return deep
                    }
                }else if(tree[i].token == 'CALL'){
                    let params = tree[i].value.slice(1)

                    for(let j = 0; j < params.length; j++){
                        if(params[j].token == 'FLAG'){
                            indexFlag(params[j].value)
                        }else if(params[j].token == 'EXPRESSION'){
                            let deep = searchForFlags(params[j])

                            if(deep instanceof Backend.Error){
                                return deep
                            }
                        }
                    }
                }
            }
        }
    }

    deep = searchForFlags(tree)

    if(deep instanceof Backend.Error){
        return deep
    }
    //#endregion
    
    //#region NOTE: Dynamic Value Init - Index Functions
    let functions = {}

    function searchForFunctions(tree){
        for(let i = 0; i < tree.length; i++){
            if(tree[i].token == 'DEFINITION'){
                if(functions[tree[i].value[0].value]){
                    return new Backend.Error(`Function '${tree[i].value[1].value}' already exists!`, tree[i].line)
                }

                functions[tree[i].value[0].value] = tree[i].value[1].value
            }
        }
    }

    deep = searchForFunctions(tree)

    if(deep instanceof Backend.Error){
        return deep
    }
    //#endregion

    //#region NOTE: Expression Optimization
    function optimizeExpression(expression){
        const params = expression.value.slice(1)

        for(let i = 0; i < params.length; i++){
            if(params[i].token == 'EXPRESSION'){
                params[i] = optimizeExpression(params[i])

                if(params[i] instanceof Backend.Error){
                    return params[i]
                }

                expression.value[i + 1] = params[i]
            }else if(params[i].token == 'CALL'){
                const cParams = params[i].value.slice(1)

                for(let j = 0; j < cParams.length; j++){
                    if(cParams[j].token == 'EXPRESSION'){
                        cParams[j] = optimizeExpression(cParams[j])

                        if(cParams[j] instanceof Backend.Error){
                            return cParams[j] 
                        }
        
                        expression.value[i + 1].value[j + 1] = cParams[j] 
                    }
                }
            }
        }

        let canBeOptimized = true

        for(let i = 0; i < params.length; i++){
            if(params[i].token == 'EXPRESSION'){
                canBeOptimized = false
            }
        }

        if(!canBeOptimized) return expression

        if(Native.isOperationDynamic(expression)) return expression

        if(!Native.canDoOperation(expression)){
            let pTypes = []

            for(let i = 0; i < params.length; i++){
                pTypes.push(params[i].token)
            }

            return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${pTypes.toString()}!`, expression.value[0].line)
        }

        return Native.optimizeOperation(expression)
    }

    function searchForExpressions(tree){
        for(let i = 0; i < tree.length; i++){
            if(tree[i].token == 'ASSIGN'){
                if(tree[i].value[0].value == 'dyn' && tree[i].value[1].token == 'KEYWORD'){
                    
                }else{
                    if(tree[i].value[1].token == 'EXPRESSION'){
                        let deep = optimizeExpression(tree[i].value[1])

                        if(deep instanceof Backend.Error){
                            return deep
                        }

                        tree[i].value[1] = deep
                    }
                }
            }else if(tree[i].token == 'DEFINITION'){
                let deep = searchForExpressions(tree[i].value[1].value)

                if(deep instanceof Backend.Error){
                    return deep
                }
            }else if(tree[i].token == 'IF'){
                let deep = undefined

                if(tree[i].value[0].token == 'EXPRESSION'){
                    deep = optimizeExpression(tree[i].value[0])

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    tree[i].value[0] = deep
                }

                deep = searchForExpressions(tree[i].value[1].value)

                if(deep instanceof Backend.Error){
                    return deep
                }
            }else if(tree[i].token == 'DELAY'){
                let deep = undefined

                if(tree[i].value[0].token == 'EXPRESSION'){
                    optimizeExpression(tree[i].value[0])

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    tree[i].value[0] = deep
                }

                deep = searchForExpressions(tree[i].value[1].value)

                if(deep instanceof Backend.Error){
                    return deep
                }
            }else if(tree[i].token == 'CALL'){
                let params = tree[i].value.slice(1)

                for(let j = 0; j < params.length; j++){
                    if(params[j].token == 'EXPRESSION'){
                        let deep = optimizeExpression(params[j])

                        if(deep instanceof Backend.Error){
                            return deep
                        }

                        tree[i].value[j + 1] = deep
                    }
                }
            }
        }
    }

    deep = searchForExpressions(tree)

    if(deep instanceof Backend.Error){
        return deep
    }

    //#endregion

    //#region NOTE: Index Dynamic Values
    let dynamicValues = {}

    function indexDynamicValues(name, expression){
        dynamicValues[name] = expression

        return {
            value: name,
            token: 'DYNAMIC VALUE'
        }
    }

    function searchForDyncamicValues(tree){
        for(let i = 0; i < tree.length; i++){
            if(tree[i].token == 'DEFINITION'){
                let deep = searchForDyncamicValues(tree[i].value[1].value)

                if(deep instanceof Backend.Error){
                    return deep
                }
            }else if(tree[i].token == 'IF'){
                tree[i].value[0] = indexDynamicValues(Backend.uuidv4(), tree[i].value[0])

                deep = searchForDyncamicValues(tree[i].value[1].value)

                if(deep instanceof Backend.Error){
                    return deep
                }
            }else if(tree[i].token == 'DELAY'){
                let deep = searchForDyncamicValues(tree[i].value[1].value)

                if(deep instanceof Backend.Error){
                    return deep
                }
            }
        }
    }

    deep = searchForDyncamicValues(tree)

    if(deep instanceof Backend.Error){
        return deep
    }

    const dynamicFlagNames = Object.keys(dynamicFlags)

    for(const i in dynamicFlagNames){
        const name = dynamicFlagNames[i]

        if(!(name in dynamicValues)){
            dynamicValues[name] = {
                value: dynamicFlags[name],
                token: 'MOLANG'
            }
        }
    }
    //#endregion
    
    //#region NOTE: Compile Dynamic Values
    const dynamicValueNames = Object.keys(dynamicValues)
    
    for(const i in dynamicValueNames){
        const name = dynamicValueNames[i]

        outAnimations['animation.firework.backend.' + name] = {
            loop: true,
            timeline: {
                '0.0': [
                    `/tag @s add frwb_dv_${name}`
                ]
            },
            animation_length: 0.001
        }

        outAnimations['animation.firework.backend.' + name + '.inverse'] = {
            loop: true,
            timeline: {
                '0.0': [
                    `/tag @s remove frwb_dv_${name}`
                ]
            },
            animation_length: 0.001
        }

        worldRuntime['minecraft:entity'].description.animations[name] = 'animation.firework.backend.' + name
        worldRuntime['minecraft:entity'].description.animations[name + '_inverse'] = 'animation.firework.backend.' + name + '.inverse'

        let scriptData = {}
        
        scriptData[name] = Native.variableToMolang(dynamicValues[name]).value

        worldRuntime['minecraft:entity'].description.scripts.animate.push(scriptData)

        scriptData = {}

        scriptData[name + '_inverse'] = '!(' + Native.variableToMolang(dynamicValues[name]).value + ')'

        worldRuntime['minecraft:entity'].description.scripts.animate.push(scriptData)
    }
    //#endregion

    //#region NOTE: Compile Flags
    const flagNames = Object.keys(flags)

    console.log(flagNames)

    for(const i in flagNames){
        const name = flagNames[i]

        let eventData = {
            set_actor_property: {},
            run_command: {
                command: [
                    `tag @s add frw_${name}`
                ]
            }
        }
    
        eventData.set_actor_property['frw:' + name] = 1

        worldRuntime['minecraft:entity'].events['frw_' + name + '_true'] = eventData

        eventData = {
            set_actor_property: {},
            run_command: {
                command: [
                    `tag @s remove frw_${name}`
                ]
            }
        }
    
        eventData.set_actor_property['frw:' + name] = 0

        worldRuntime['minecraft:entity'].events['frw_' + name + '_false'] = eventData

        worldRuntime['minecraft:entity'].description.properties['frw:' + name] = {
            values: [
                0,
                1
            ]
        }
    }
    //#endregion
    
    //#region NOTE: Compile Code Blocks
    let delayChannelTicks = []
    
    function compileCodeBlock(name, value){
        let commands = []

        let eventData = {
            run_command: {
                command: []
            }
        }

        for(let i = 0; i < value.length; i++){
            if(value[i].token == 'CALL'){
                const name = value[i].value[0].value
                const params = value[i].value.slice(1)

                if(!Native.doesFunctionExist(name) && !functionNames.includes(name)){
                    return new Backend.Error(`Function ${name} does not exist!`, value[i].line)
                }

                if(Native.doesFunctionExist(name)){
                    if(!Native.doesFunctionExistWithTemplate(name, params)){
                        return new Backend.Error(`Function ${name} does not exist with template!`, value[i].line)
                    }

                    let entity = Native.getFunction(name, params)

                    for(let j = 0; j < entity.commands.length; j++){
                        commands.push(entity.commands[j])
                    }
                } else{
                    commands.push(`event entity @s frw_${name}`)
                }
            }else if(value[i].token == 'ASSIGN'){
                console.log('FLAG COMPILE')
                console.log(value[i].value[1].value)
                if(value[i].value[1].value == 'true'){
                    commands.push(`event entity @s frw_${value[i].value[0].value}_true`)
                }else{
                    commands.push(`event entity @s frw_${value[i].value[0].value}_false`)
                }
            }else if(value[i].token == 'IF'){
                const valueID = value[i].value[0].value

                compileCodeBlock('frwb_' + valueID, value[i].value[1].value)

                commands.push(`event entity @s[tag=frwb_dv_${valueID}] frw_frwb_${valueID}`)
            }else if(value[i].token == 'DELAY'){
                const delayID = Backend.uuidv4()
                const delay = Native.tokenToUseable(value[i].value[0])

                compileCodeBlock('frwb_delay_result_' + delayID, value[i].value[1].value)

                let triggerCommands = []

                for(let j = 0; j < config.delayChannels; j++){
                    triggerCommands.push(`event entity @s[tag=!frwb_delay_added] frwb_delay_trigger_channel_${j}_${delayID}`)

                    worldRuntime['minecraft:entity'].events[`frwb_delay_trigger_channel_${j}_${delayID}`] = {
                        run_command: {
                            command: [
                                'tag @s add frwb_delay_added',
                                `tag @s add frwb_delay_tick_channel_${j}_0_${delayID}`
                            ]
                        }
                    }

                    for(let u = delay; u > 0; u--){
                        if(u == delay){
                            delayChannelTicks.push(`event entity @s[tag=frwb_delay_tick_channel_${j}_${u - 1}_${delayID}] frwb_delay_tick_channel_${j}_${u}_${delayID}`)
                        
                            worldRuntime['minecraft:entity'].events[`frwb_delay_tick_channel_${j}_${u}_${delayID}`] = {
                                run_command: {
                                    command: [
                                        `tag @s remove frwb_delay_tick_channel_${j}_${u - 1}_${delayID}`,
                                        `event entity @s frw_frwb_delay_result_${delayID}`
                                    ]
                                }
                            }

                            continue
                        }

                        delayChannelTicks.push(`event entity @s[tag=frwb_delay_tick_channel_${j}_${u - 1}_${delayID}] frwb_delay_tick_channel_${j}_${u}_${delayID}`)
                        
                        worldRuntime['minecraft:entity'].events[`frwb_delay_tick_channel_${j}_${u}_${delayID}`] = {
                            run_command: {
                                command: [
                                    `tag @s remove frwb_delay_tick_channel_${j}_${u - 1}_${delayID}`,
                                    `tag @s add frwb_delay_tick_channel_${j}_${u}_${delayID}`
                                ]
                            }
                        }
                    }
                }

                triggerCommands.push('tag @s remove frwb_delay_added')

                worldRuntime['minecraft:entity'].events['frwb_delay_trigger_' + delayID] = {
                    run_command: {
                        command: triggerCommands
                    }
                }

                commands.push(`event entity @s frwb_delay_trigger_${delayID}`)
            }
        }
    
        eventData.run_command.command = commands

        worldRuntime['minecraft:entity'].events['frw_' + name] = eventData
    }
    
    const functionNames = Object.keys(functions)

    for(const i in functionNames){
        const name = functionNames[i]

        let deep = compileCodeBlock(name, functions[name])

        if(deep instanceof Backend.Error){
            return deep
        }
    }

    worldRuntime['minecraft:entity'].events.frwb_delay = {
        run_command: {
            command: delayChannelTicks
        }
    }
    //#endregion

    return {
        animations: outAnimations,
        entity: worldRuntime
    }
}