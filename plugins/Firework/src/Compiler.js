import * as Backend from './Backend.js'
import * as Native from './Native.js'

export function Compile(tree, config, source){
    //#region NOTE: Setup json values for editing DONE
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


    //#region NOTE: Create variables to be added to durring overviewing the execution tree DONE
    let blocks = {}

    let delays = {}

    let dynamicValues = {}

    let flags = []

    let delaySteps = []
    //#endregion

    //#region NOTE: Expression to molang to be used in setting values DONE
    function expressionToMolang(expression){
        let result = ''

        if(expression.token == 'INTEGER' || expression.token == 'BOOLEAN'){
            result = expression.value
        }else if(expression.token == 'MOLANG'){
            result = '(' + expression.value + ')'
        }else if(expression.token == 'EXPRESSION'){
            if(expression.value[0].value == '!'){
                const deep = expressionToMolang(expression.value[1]) + ' == 0'

                if(deep instanceof Backend.Error){
                    return deep
                }

                result = '(' + deep + ')'
            }else{
                const deep = expressionToMolang(expression.value[1]) + ' ' + expression.value[0].value + ' ' + expressionToMolang(expression.value[2])

                if(deep instanceof Backend.Error){
                    return deep
                }

                result = '(' + deep + ')'
            }
        }else if(expression.token == 'FLAG'){
            result = `(q.actor_property('frw:${expression.value}'))`
        }else if(expression.token == 'CALL'){
            if(!Native.doesFunctionExist(expression.value[0].value)){
                return new Backend.Error(`Method '${expression.value[0].value}' does not exist!`)
            }

            if(!Native.doesFunctionSupportMolang(expression.value[0].value)){
                return new Backend.Error(`Method '${expression.value[0].value}' is not supported in expression!`)
            }

            if(!Native.doesFunctionExistWithTemplate(expression.value[0].value, expression.value.slice(1))){
                return new Backend.Error(`Method '${expression.value[0].value}' does not match any template!`)
            }

            result = Native.getFunction(expression.value[0].value, expression.value.slice(1))
        }else{
            return new Backend.Error('Unknown expression token: ' + expression.token + '!')
        }

        return result
    }

    function indexFlag(flag){
        if(!flags.includes(flag.value)){
            flags.push(flag.value)
        }
    }
    //#endregion

    
    //#region NOTE: Optimizes expressions for molang
    function optimizeExpression(expression){
        let dynamic = false

        if(expression.token == 'SYMBOL' && (expression.value[0].value == '+' || expression.value[0].value == '-' || expression.value == '*'[0].value || expression.value == '/'[0].value || expression.value[0].value == '&&' || expression.value[0].value == '||' || expression.value[0].value == '==' || expression.value[0].value == '>' || expression.value[0].value == '<' || expression.value[0].value == '>=' || expression.value[0].value == '<=')){
            if(expression.value[1].token == 'EXPRESSION'){
                const deep = optimizeExpression(expression.value[1])

                if(deep instanceof Backend.Error){
                    return deep
                }

                expression.value[1] = deep
            }

            if(expression.value[2].token == 'EXPRESSION'){
                const deep = optimizeExpression(expression.value[2])

                if(deep instanceof Backend.Error){
                    return deep
                }

                expression.value[2] = deep
            }
            
            if(expression.value[1].dynamic || expression.value[2].dynamic){
                dynamic = true
            }

            if(expression.value[1].token == 'FLAG' || expression.value[2].token == 'FLAG'){
                if(expression.value[1].token == 'FLAG'){
                    indexFlag(expression.value[1])
                }

                if(expression.value[2].token == 'FLAG'){
                    indexFlag(expression.value[2])
                }

                dynamic = true
            }

            if(expression.value[1].token == 'MOLANG' || expression.value[2].token == 'MOLANG'){
                dynamic = true
            }
        }else if(expression.token == 'SYMBOL' && (expression.value[0].value == '!')){
            if(expression.value[1].token == 'EXPRESSION'){
                const deep = optimizeExpression(expression.value[1])

                if(deep instanceof Backend.Error){
                    return deep
                }

                expression.value[1] = deep
            }

            if(expression.value[1].dynamic){
                dynamic = true
            }

            if(expression.value[1].token == 'FLAG'){
                dynamic = true

                indexFlag(expression.value[1])
            }

            if(expression.value[1].token == 'MOLANG'){
                dynamic = true
            }
        }

        if(dynamic){
            expression.dynamic = true
        }else{
            if(expression.value[0].value == '+'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) + parseInt(expression.value[2].value)).toString(), token: 'INTEGER' }
            }else if(expression.value[0].value == '-'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) - parseInt(expression.value[2].value)).toString(), token: 'INTEGER' }
            }else if(expression.value[0].value == '*'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) * parseInt(expression.value[2].value)).toString(), token: 'INTEGER' }
            }else if(expression.value[0].value == '+'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) / parseInt(expression.value[2].value)).toString(), token: 'FLOAT' }
            }else if(expression.value[0].value == '>'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) > parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '<'){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) < parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '>='){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) >= parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '<='){
                if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (parseInt(expression.value[1].value) <= parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '&&'){
                if(!(expression.value[1].token == 'BOOLEAN' || expression.value[1].token == 'MOLANG' || expression.value[1].token == 'FLAG') || !(expression.value[2].token == 'BOOLEAN' || expression.value[2].token == 'MOLANG' || expression.value[2].token == 'FLAG')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (expression.value[1].value == 'true' && expression.value[2].value == 'true').toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '||'){
                if(!(expression.value[1].token == 'BOOLEAN' || expression.value[1].token == 'MOLANG' || expression.value[1].token == 'FLAG') || !(expression.value[2].token == 'BOOLEAN' || expression.value[2].token == 'MOLANG' || expression.value[2].token == 'FLAG')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                }

                expression = { value: (expression.value[1].value == 'true' || expression.value[2].value == 'true').toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '!'){
                if(!(expression.value[1].token == 'BOOLEAN' || expression.value[1].token == 'MOLANG' || expression.value[1].token == 'FLAG')){
                    return new Backend.Error(`Can not do operation ${expression.value[0].value} on type ${expression.value[1].token}!`)
                }

                expression = { value: (expression.value[1].value != 'true').toString(), token: 'BOOLEAN' }
            }else if(expression.value[0].value == '=='){
                if(expression.value[1].token != expression.value[2].token){
                    expression = { value: 'false', token: 'BOOLEAN' }
                }else{
                    expression = { value: (expression.value[1].value == expression.value[2].value).toString(), token: 'BOOLEAN' }
                }
            }
        }

        return expression
    }
    //#endregion


    //#region NOTE: Util Functions
    function searchForExpression(tree){
        if(tree.token == 'DEFINITION' || tree.token == 'IF' || tree.token == 'DELAY'){
            const deep = searchForExpression(tree.value[1].value)
            
            if(deep instanceof Backend.Error){
                return deep
            }

            tree.value[1].value = deep
        }else if(tree.token == 'CALL'){
            for(let i = 1; i < tree.value.length; i++){
                if(tree.value[i].token == 'EXPRESSION'){
                    const deep = optimizeExpression(tree.value[i])

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    tree.value[i] = deep
                }
            }
        }

        return tree
    }
   
    function indexCodeBlock(block, mode, condition = null, preferedID = null){
        for(let i = 0; i < block.value.length; i++){
            const deep = searchForCodeBlock(block.value[i])

            if(deep instanceof Backend.Error){
                return deep
            }

            block.value[i] = deep
        }

        let ID = Backend.uuidv4()

        if(preferedID != null && !blocks[preferedID]){
            ID = preferedID
        }

        if(mode == 'conditional'){
            const deep = expressionToMolang(condition)

            if(deep instanceof Backend.Error){
                return deep
            }

            dynamicValues[ID] = {
                condition: deep
            }
        }else if(mode == 'delay'){
            if(condition.token != 'INTEGER'){
                return new Backend.Error(`Delay must be an integer!`)
            }

            if(parseInt(condition.value) <= 0){
                return new Backend.Error(`Delay must be greater than 0!`)
            }

            delays[ID] = parseInt(condition.value)
        }

        blocks[ID] = block.value

        block = { value: [ID, mode], token: 'BLOCKREF'}

        return block
    }

    function searchForCodeBlock(tree){
        if(tree.token == 'DEFINITION'){
            const deep = indexCodeBlock(tree.value[1], 'normal', null, tree.value[0].value)

            if(deep instanceof Backend.Error){
                return deep
            }

            tree.value[1] = deep
        }else if(tree.token == 'IF'){
            const deep = indexCodeBlock(tree.value[1], 'conditional', tree.value[0])

            if(deep instanceof Backend.Error){
                return deep
            }

            tree.value[1] = deep
        }else if(tree.token == 'DELAY'){
            const deep = indexCodeBlock(tree.value[1], 'delay', tree.value[0])

            if(deep instanceof Backend.Error){
                return deep
            }

            tree.value[1] = deep
        }

        return tree
    }

    function searchForFlags(tree){
        if(tree.token == 'DEFINITION' || tree.token == 'IF' || tree.token == 'DELAY'){
            if(tree.value[0].token == 'EXPRESSION'){
                const deep = searchForFlags(tree.value[0])

                if(deep instanceof Backend.Error){
                    return deep
                }

                tree.value[0] = deep
            }else if(tree.value[0].token == 'FLAG'){
                indexFlag(tree.value[0])
            }

            for(let i = 0; i < tree.value[1].value.length; i++){
                const deep = searchForFlags(tree.value[1].value[i])

                if(deep instanceof Backend.Error){
                    return deep
                }

                tree.value[1].value[i] = deep
            }
        }else if(tree.token == 'ASSIGN' && tree.value[0].token == 'FLAG'){
            indexFlag(tree.value[0])
        }

        return tree
    }
    //#endregion


    //#region NOTE: Do All The Searching Indexing And Optimization 
    for(let i = 0; i < tree.length; i++){
        const deep = searchForExpression(tree[i])

        if(deep instanceof Backend.Error){
            return deep
        }

        tree[i] = deep
    }

    for(let i = 0; i < tree.length; i++){
        const deep = searchForFlags(tree[i])

        if(deep instanceof Backend.Error){
            return deep
        }

        tree[i] = deep
    }

    for(let i = 0; i < tree.length; i++){
        const deep = searchForCodeBlock(tree[i])

        if(deep instanceof Backend.Error){
            return deep
        }

        tree[i] = deep
    }
    //#endregion


    //#region NOTE: Create animations json for flags (sets up anims for adding and removing flag tags)
    //TODO: Make reliable
    for(let i = 0; i < flags.length; i++){
        let data = {
            default: 0,
            values: [
                0,
                1
            ]
        }

        worldRuntime['minecraft:entity'].description.properties['frw:' + flags[i]] = data

        let eventData = {
            set_actor_property: {},
            run_command: {
                command: []
            }
        }
        
        eventData.set_actor_property['frw:' + flags[i]] = 1
        eventData.run_command.command.push(`tag @s add frw:${flags[i]}`)

        worldRuntime['minecraft:entity'].events['frw:set_' + flags[i]] = eventData

        eventData = {
            set_actor_property: {},
            run_command: {
                command: []
            }
        }
        
        eventData.set_actor_property['frw:' + flags[i]] = 0
        eventData.run_command.command.push(`tag @s remove frw:${flags[i]}`)

        worldRuntime['minecraft:entity'].events['frw:unset_' + flags[i]] = eventData
    }
    //#endregion


    //#region NOTE: Create animations for dynamic values like if params and dynamic flags
    const dynamicValueNames = Object.getOwnPropertyNames(dynamicValues)

    //TODO: Make reliable
    for(let i = 0; i < dynamicValueNames.length; i++){
        let data = {
            default: 0,
            values: [
                0,
                1
            ]
        }

        worldRuntime['minecraft:entity'].description.properties['frw:' + dynamicValueNames[i]] = data

        let animCont = {
            "format_version": "1.10.0",
            "animations": {}
        }

        animCont.animations['animation.firework.runtime.' + dynamicValueNames[i]] = {
            "loop": true,
            "timeline": {
                "0.0": [
                    `/tag @s add frw_conditional_${dynamicValueNames[i]}`
                ]
            },
            "animation_length": 0.001
        }

        outAnimations['frw_' + dynamicValueNames[i] + '.json'] = JSON.stringify(animCont, null, 4)

        worldRuntime['minecraft:entity'].description.animations[dynamicValueNames[i]] = 'animation.firework.runtime.' + dynamicValueNames[i]

        let animData = {}

        animData[dynamicValueNames[i]] = dynamicValues[dynamicValueNames[i]].condition

        worldRuntime['minecraft:entity'].description.scripts.animate.push(animData)

        animCont = {
            "format_version": "1.10.0",
            "animations": {}
        }

        animCont.animations['animation.firework.runtime.' + dynamicValueNames[i] + '.inverse'] = {
            "loop": true,
            "timeline": {
                "0.0": [
                    `/tag @s remove frw_conditional_${dynamicValueNames[i]}`
                ]
            },
            "animation_length": 0.001
        }

        outAnimations['frw_' + dynamicValueNames[i] + '_inverse.json'] = JSON.stringify(animCont, null, 4)

        worldRuntime['minecraft:entity'].description.animations[dynamicValueNames[i] + '_inverse'] = 'animation.firework.runtime.' + dynamicValueNames[i] + '.inverse'

        animData = {}

        animData[dynamicValueNames[i] + '_inverse'] = '(' + dynamicValues[dynamicValueNames[i]].condition + ') == 0'

        worldRuntime['minecraft:entity'].description.scripts.animate.push(animData)
    }
    //#endregion


    //#region NOTE: Add code blocks as events to entities
    const blockNames = Object.getOwnPropertyNames(blocks)

    for(let i = 0; i < blockNames.length; i++){
        let data = {
            sequence: []
        }

        for(let l = 0; l < blocks[blockNames[i]].length; l++){
            if(blocks[blockNames[i]][l].token == 'CALL'){
                const callName = blocks[blockNames[i]][l].value[0].value
                const callParams = blocks[blockNames[i]][l].value.slice(1)

                if(Native.doesFunctionExist(callName)){
                    if(!Native.doesFunctionSupportEntity(callName)){
                        return new Backend.Error(`Method '${callName}' is not supported in code blocks!`)
                    }
        
                    if(!Native.doesFunctionExistWithTemplate(callName, callParams)){
                        return new Backend.Error(`Method '${callName}' does not match any template!`)
                    }

                    data.sequence.push(Native.getFunction(callName, callParams))
                }else if(blocks[callName]){
                    data.sequence.push({
                        run_command: {
                            command: [
                                `event entity @s frw:${callName}`
                            ]
                        }
                    })
                }else{
                    return new Backend.Error(`Method '${callName}' does not exist!`)
                }
            }else if(blocks[blockNames[i]][l].token == 'DEFINITION' || blocks[blockNames[i]][l].token == 'IF' || blocks[blockNames[i]][l].token == 'DELAY'){
                if(blocks[blockNames[i]][l].value[1].value[1] == 'normal'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                'event entity @s frw:' + blocks[blockNames[i]][l].value[1].value[0]
                            ]
                        }
                    })
                }else if(blocks[blockNames[i]][l].value[1].value[1] == 'conditional'){
                    data.sequence.push({
                        run_command: {
                            command: [
                                `event entity @s[tag=frw_conditional_${blocks[blockNames[i]][l].value[1].value[0]}] frw:` + blocks[blockNames[i]][l].value[1].value[0]
                            ]
                        }
                    })
                }else if(blocks[blockNames[i]][l].value[1].value[1] == 'delay'){           
                    //Delay Intialization
                    data.sequence.push({
                        run_command: {
                            command: [
                                'event entity @s frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_trigger'
                            ]
                        }
                    })

                    //Delay Triggering
                    for(let j = 0; j < config.delayChannels; j++){
                        let channelData = {
                            run_command: {
                                command: [
                                    `tag @s add frw_${blocks[blockNames[i]][l].value[1].value[0]}_time_${delays[blocks[blockNames[i]][l].value[1].value[0]]}_channel_${j}`,
                                    'tag @s add added'
                                ]
                            }
                        }

                        worldRuntime['minecraft:entity'].events['frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_channel_' + j.toString()] = channelData
                    }

                    //Delay Channel Choosing
                    let delayCallData = {
                        run_command: {
                            command: [
                            ]
                        }
                    }

                    for(let j = 0; j < config.delayChannels; j++){
                        delayCallData.run_command.command.push(`event entity @s[tag=!added, tag=!frw_${blocks[blockNames[i]][l].value[1].value[0]}_time_${delays[blocks[blockNames[i]][l].value[1].value[0]]}_channel_${j}] ${'frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_channel_' + j.toString()}`)
                    }

                    delayCallData.run_command.command.push(`tag @s remove added`)

                    worldRuntime['minecraft:entity'].events['frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_trigger'] = delayCallData

                    //Delay Stepping
                    for(let j = 0; j < config.delayChannels; j++){
                        for(let k = delays[blocks[blockNames[i]][l].value[1].value[0]]; k > 0; k--){
                            let timeData = {
                                run_command: {
                                    command: [
                                        `tag @s remove frw_${blocks[blockNames[i]][l].value[1].value[0]}_time_${k}_channel_${j}`,
                                        `tag @s add frw_${blocks[blockNames[i]][l].value[1].value[0]}_time_${k - 1}_channel_${j}`
                                    ]
                                }
                            }

                            if(k == 1){
                                timeData.run_command.command = [
                                    `tag @s remove frw_${blocks[blockNames[i]][l].value[1].value[0]}_time_${k}_channel_${j}`,
                                    `event entity @s frw:${blocks[blockNames[i]][l].value[1].value[0]}`
                                ]
                            }
    
                            worldRuntime['minecraft:entity'].events['frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_time_' + k.toString() + '_channel_' + j.toString()] = timeData
                        }
                    }

                    //Add Delay Stepping
                    for(let j = 0; j < config.delayChannels; j++){
                        for(let k = delays[blocks[blockNames[i]][l].value[1].value[0]]; k > 0; k--){
                            delaySteps.unshift(`event entity @s[tag=frw_${blocks[blockNames[i]][l].value[1].value[0] + '_time_' + k.toString() + '_channel_' + j.toString()}] ${'frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_time_' + k.toString() + '_channel_' + j.toString()}`)
                        }
                    }
                }
            }else if(blocks[blockNames[i]][l].token == 'ASSIGN'){
                if(blocks[blockNames[i]][l].value[1].value == 'true'){
                    data.sequence.push(
                        {
                            run_command: {
                                command: [
                                    `event entity @s frw:set_${blocks[blockNames[i]][l].value[0].value}`
                                ]
                            }
                        }
                    )
                }else{
                    data.sequence.push(
                        {
                            run_command: {
                                command: [
                                    `event entity @s frw:unset_${blocks[blockNames[i]][l].value[0].value}`
                                ]
                            }
                        }
                    )
                }
            }
        }

        worldRuntime['minecraft:entity'].events['frw:' + blockNames[i]] = data
    }
    //#endregion


    //#region NOTE: Setup delay steps DONE
    worldRuntime['minecraft:entity'].events['frwb:delay'] = {
        run_command: {
            command: delaySteps
        }
    }
    //#endregion


    return {
        animations: outAnimations,
        entity: worldRuntime
    }
}