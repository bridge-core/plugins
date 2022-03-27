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

export function Compile(tree, config, source, scriptConfig){
    console.log(JSON.parse(JSON.stringify(tree)))

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

    //#region NOTE: Static Value Init - Config constants
    let configConstants = {}

    let scriptConfigKeys = Object.keys(scriptConfig)

    for(let key of scriptConfigKeys){
        if(!scriptConfig[key]){
            return new Backend.Error('Script config is missing a value for ' + key + '!', -1)
        }

        let token = Native.valueToToken(scriptConfig[key])

        if(!token){
            return new Backend.Error('Script config has an invalid value for ' + key + '!', -1)
        }

        configConstants[key] = token
    }
    //#endregion

    //#region NOTE: Static Value Init - Replace Congfig Constants
    function searchForConfigConstants(tree){
        if(tree.token == 'EXPRESSION'){
            for(let i = 0; i < tree.value.length; i++){
                if(tree.value[i].token == 'EXPRESSION'){
                    let deep = searchForConfigConstants(tree.value[i])

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    tree.value[i] = deep
                }else if(tree.value[i].token == 'NAME'){
                    if(configConstants[tree.value[i].value]){
                        tree.value[i] = configConstants[tree.value[i].value]
                    }
                }
            }
        }else{
            for(let i = 0; i < tree.length; i++){
                if(tree[i].token == 'ASSIGN'){
                    if(tree[i].value[1].token == 'NAME'){
                        if(configConstants[tree[i].value[1].value]){
                            tree.value[1] = configConstants[tree[i].value[1].value]
                        }
                    }else if(tree[i].value[1].token == 'EXPRESSION'){
                        let deep = searchForConfigConstants(tree[i].value[1])

                        if(deep instanceof Backend.Error){
                            return deep
                        }
                        
                        tree[i].value[1] = deep
                    }
                }else if(tree[i].token == 'DEFINITION'){
                    let deep = searchForConfigConstants(tree[i].value[1].value)

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    tree[i].value[1].value = deep
                }else if(tree[i].token == 'IF'){
                    let deep = searchForConfigConstants(tree[i].value[0])

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    deep = searchForConfigConstants(tree[i].value[1].value)

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    tree[i].value[1].value = deep
                }else if(tree[i].token == 'ELSE'){
                    let deep = searchForConfigConstants(tree[i].value[0])

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    tree[i].value[0] = deep
                }else if(tree[i].token == 'DELAY'){
                    if(tree[i].value[0].token == 'NAME'){
                        if(configConstants[tree[i].value[0].value]){
                            tree[i].value[0] = configConstants[tree[i].value[0].value]
                        }
                    }

                    let deep = searchForConfigConstants(tree[i].value[1].value)

                    if(deep instanceof Backend.Error){
                        return deep
                    }

                    tree[i].value[1].value = deep
                }else if(tree[i].token == 'CALL'){
                    let params = tree[i].value.slice(1)

                    for(let j = 0; j < params.length; j++){
                        if(params[j].token == 'NAME'){
                            if(configConstants[params[j].value]){
                                tree[i].value[j + 1] = configConstants[params[j].value]
                            }
                        }else if(params[j].token == 'EXPRESSION'){
                            let deep = searchForConfigConstants(params[j])

                            if(deep instanceof Backend.Error){
                                return deep
                            }

                            tree[i].value[j + 1] = deep
                        }
                    }
                }
            }
        }

        return tree
    }

    tree = searchForConfigConstants(tree)

    if(tree instanceof Backend.Error){
        return tree
    }
    //#endregion

    //#region NOTE: Static Value Init - Setup if delays
    function setupIfDelays(tree){
        for(let i = 0; i < tree.length; i++){
            if(tree[i].token == 'DEFINITION'){
                let deep = setupIfDelays(tree[i].value[1].value)

                if(deep instanceof Backend.Error){
                    return deep
                }

                tree[i].value[1].value = deep
            }else if(tree[i].token == 'IF'){
                let deep = setupIfDelays(tree[i].value[1].value)

                if(deep instanceof Backend.Error){
                    return deep
                }

                tree[i].value[1].value = deep

                tree[i] = {
                    token: 'DELAY',
                    value: [
                        { 
                            value: '2',
                            token: 'INTEGER'
                        },
                        {
                            token: 'BLOCK',
                            value: [
                                tree[i]
                            ]
                        }
                    ]
                }

                let remaining = tree.slice(i + 1, tree.length)

                if(remaining.length > 0){
                    let deep2 = setupIfDelays(remaining)

                    if(deep2 instanceof Backend.Error){
                        return deep2
                    }

                    for(let j = 0; j < deep2.length; j++){
                        tree[i].value[1].value.push(deep2[j])
                    }

                    tree.splice(i + 1, remaining.length + 1)
                }
            }else if(tree[i].token == 'ELSE'){
                let deep = setupIfDelays(tree[i].value[0])

                if(deep instanceof Backend.Error){
                    return deep
                }

                tree[i].value[0] = deep
            }else if(tree[i].token == 'DELAY'){
                let deep = setupIfDelays(tree[i].value[1].value)

                if(deep instanceof Backend.Error){
                    return deep
                }

                tree[i].value[1].value = deep
            }
        }

        return tree
    }

    tree = setupIfDelays(tree)

    if(tree instanceof Backend.Error){
        return tree
    }
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
                        if(Native.complexTypeToSimpleType(tree[i].value[1].token) != 'BOOLEAN'){
                            return new Backend.Error(`Flag '${tree[i].value[0].value}' can only be assigned to a boolean value! It was assigned to '${tree[i].value[1].token}'.`, tree[i].line)
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
                }
                else if(tree[i].token == 'FIF'){
                    let deep = searchForFlags(tree[i].value[0])

                    if(deep instanceof Backend.Error){
                        return deep
                    }
                    
                    deep = searchForFlags(tree[i].value[1].value)

                    if(deep instanceof Backend.Error){
                        return deep
                    }
                }else if(tree[i].token == 'ELSE'){
                    let deep = searchForFlags(tree[i].value[0])

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

    let deep = searchForFlags(tree)

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
            }else if(tree[i].token == 'FIF'){
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
            }else if(tree[i].token == 'ELSE'){
                let deep = searchForExpressions(tree[i].value[0].value)

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
        if(expression.token == 'DYNAMIC VALUE') return expression
        
        dynamicValues[name] = expression

        return {
            value: name,
            token: 'DYNAMIC VALUE',
            line: expression.line
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
            }else if(tree[i].token == 'FIF'){
                tree[i].value[0] = indexDynamicValues(Backend.uuidv4(), tree[i].value[0])

                deep = searchForDyncamicValues(tree[i].value[1].value)

                if(deep instanceof Backend.Error){
                    return deep
                }
            }else if(tree[i].token == 'ELSE'){
                deep = searchForDyncamicValues(tree[i].value[0].value)

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
    //#endregion

    //#region NOTE: Compile Flags
    const flagNames = Object.keys(flags)

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

                    let funcIsStatic = true

                    for(const param of params){
                        if(!Native.isTypeStatic(param.token)){
                            funcIsStatic = false
                            break
                        }
                    }

                    if(!funcIsStatic){
                        let combinations = []
                        let newCombinations = []

                        for(const param of params){
                            let paramType = Native.complexTypeToSimpleType(param.token)

                            let paramValues = []
                            newCombinations = []
                            
                            if(Native.isComplexType(param.token)){
                                switch(paramType){
                                    case 'BOOLEAN':
                                        paramValues = [
                                            {
                                                value: 'true',
                                                token: 'BOOLEAN'
                                            },
                                            {
                                                value: 'false',
                                                token: 'BOOLEAN'
                                            }
                                        ]

                                        break
                                }
                            }else{
                                paramValues = [ param ]
                            }

                            if(combinations.length == 0){
                                for(const paramValue of paramValues){
                                    newCombinations.push([ paramValue ])
                                }
                            }else{
                                for(const paramValue of paramValues){
                                    for(let combination of combinations){
                                        combination.push(paramValue)

                                        newCombinations.push(combination)
                                    }
                                }
                            }

                            combinations = newCombinations

                            const subID = Backend.uuidv4()

                            let subBlock = {
                                token: 'BLOCK',
                                value: [
                                    {
                                        token: 'DELAY',
                                        value: [
                                            {
                                                token: 'INTEGER',
                                                value: '2'
                                            },
                                            {
                                                token: 'BLOCK',
                                                value: []
                                            }
                                        ]
                                    }
                                ]
                            }

                            for(const combination of combinations){
                                let molang = ''

                                for(const param in combination){
                                    let deep1 = Native.variableToMolang(params[param])

                                    if(deep1 instanceof Backend.Error) return deep1

                                    let deep2 = Native.variableToMolang(combination[param])
                                    
                                    if(deep2 instanceof Backend.Error) return deep2

                                    molang += `(${deep1.value} == ${deep2.value}) && `
                                }

                                molang = molang.substring(0, molang.length - 4)

                                let subBlockValue = {
                                    token: 'FIF',
                                    value: [
                                        indexDynamicValues(Backend.uuidv4(), { value: molang, token: 'MOLANG' }),
                                        {
                                            token: 'BLOCK',
                                            value: []
                                        }
                                    ]
                                }

                                let entity = Native.getFunction(name, combination)

                                if(entity instanceof Backend.Error) return entity

                                console.log(entity.commands)

                                for(let j = 0; j < entity.commands.length; j++){
                                    subBlockValue.value[1].value.push({
                                        token: 'CALL',
                                        value: [
                                            {
                                                value: 'rc',
                                                token: 'NAME'
                                            },
                                            {
                                                token: 'STRING',
                                                value: entity.commands[j]
                                            }
                                        ]
                                    })
                                }

                                subBlock.value[0].value[1].value.push(subBlockValue)
                            }

                            subBlock.value[0].value[1].value = subBlock.value[0].value[1].value.concat(value.slice(i + 1))
                            value.splice(i + 1, value.length - i - 1)

                            console.log('SUB BLOCK:')
                            console.log(subBlock)

                            compileCodeBlock('param_' + subID, subBlock.value)

                            commands.push(`event entity @s frw_param_${subID}`)
                        }
                    }else{
                        let entity = Native.getFunction(name, params)

                        if(entity instanceof Backend.Error) return entity

                        for(let j = 0; j < entity.commands.length; j++){
                            commands.push(entity.commands[j])
                        }
                    }
                } else{
                    commands.push(`event entity @s frw_${name}`)
                }
            }else if(value[i].token == 'ASSIGN'){
                if(value[i].value[1].token == 'BOOLEAN'){
                    if(value[i].value[1].value == 'true'){
                        commands.push(`event entity @s frw_${value[i].value[0].value}_true`)
                    }else{
                        commands.push(`event entity @s frw_${value[i].value[0].value}_false`)
                    }
                }else{
                    let subBlock = [
                        {
                            token: 'DELAY',
                            value: [
                                {
                                    token: 'INTEGER',
                                    value: '5'
                                },
                                {
                                    token: 'BLOCK',
                                    value: [
                                        {
                                            token: 'IF',
                                            value: [
                                                indexDynamicValues(Backend.uuidv4(), value[i].value[1]),
                                                {
                                                    token: 'BLOCK',
                                                    value: [
                                                        {
                                                            token: 'ASSIGN',
                                                            value: [
                                                                {
                                                                    token: 'FLAG',
                                                                    value: value[i].value[0].value
                                                                },
                                                                {
                                                                    token: 'BOOLEAN',
                                                                    value: 'true'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            token: 'ELSE',
                                            value: [
                                                {
                                                    token: 'BLOCK',
                                                    value: [
                                                        {
                                                            token: 'ASSIGN',
                                                            value: [
                                                                {
                                                                    token: 'FLAG',
                                                                    value: value[i].value[0].value
                                                                },
                                                                {
                                                                    token: 'BOOLEAN',
                                                                    value: 'false'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]

                    subBlock[0].value[1].value = subBlock[0].value[1].value.concat(value.slice(i + 1))
                    value.splice(i + 1, value.length - i - 1)

                    const subID = Backend.uuidv4()

                    commands.push(`event entity @s frw_${subID}`)

                    compileCodeBlock(subID, subBlock)
                }
            }else if(value[i].token == 'IF'){
                const valueID = value[i].value[0].value

                compileCodeBlock('frwb_' + valueID, value[i].value[1].value)

                commands.push(`event entity @s[tag=frwb_dv_${valueID}] frw_frwb_${valueID}`)
            }else if(value[i].token == 'FIF'){
                const valueID = value[i].value[0].value

                compileCodeBlock('frwb_' + valueID, value[i].value[1].value)

                commands.push(`event entity @s[tag=frwb_dv_${valueID}] frw_frwb_${valueID}`)
            }else if(value[i].token == 'ELSE'){
                const valueID = value[i - 1].value[0].value

                compileCodeBlock('frwb_else_' + valueID, value[i].value[0].value)

                commands.push(`event entity @s[tag=!frwb_dv_${valueID}] frw_frwb_else_${valueID}`)
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

        let deep = Native.variableToMolang(dynamicValues[name])

        if(deep instanceof Backend.Error) return deep
        
        scriptData[name] = deep.value

        worldRuntime['minecraft:entity'].description.scripts.animate.push(scriptData)

        scriptData = {}

        deep = Native.variableToMolang(dynamicValues[name])

        scriptData[name + '_inverse'] = '!(' + deep.value + ')'

        worldRuntime['minecraft:entity'].description.scripts.animate.push(scriptData)
    }
    //#endregion

    return {
        animations: outAnimations,
        entity: worldRuntime
    }
}