(function () {
    'use strict';

    class Error{
        constructor(message, line){
            this.message = message;
            this.line = line;
        }
    }

    function uuidv4(){
        let d = new Date().getTime(),
        d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = Math.random() * 16;
            if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
            } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
            }
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
        })
    }

    const functions = {
        rc: {
            params: [
                'STRING'
            ],

            asEntity (params) {
                return {
                    commands:[
                        params[0].value
                    ]
                }
            },

            supports: 'entity'
        },

        move: {
            params: [
                'STRING'
            ],

            asEntity (params) {
                return {
                    commands:[
                        'tp ' + params[0].value
                    ]
                }
            },

            supports: 'entity'
        },

        die: {
            params: [],

            asEntity (params) {
                return {
                    commands:[
                        'kill @s'
                    ]
                }
            },

            supports: 'entity'
        },

        say: {
            params: [
                'STRING'
            ],

            asEntity (params) {
                return {
                    animations: {},
                    commands:[
                        'say ' + params[0].value
                    ]
                }
            },

            supports: 'entity'
        },

        rand: {
            variations: [
                {
                    params: [],
            
                    asMolang (params) {
                        return `(math.random(0, 1) >= 0.5)`
                    },

                    dynamic: true
                },

                {
                    params: [
                        'INTEGER'
                    ],
            
                    asMolang (params) {
                        return `(math.random(0, 1) >= ${1 / variableToMolang(params[0]).value * 0.5})`
                    },

                    dynamic: true
                }
            ],

            supports: 'molang'
        }
    };

    function doesFunctionExist(name){
        return functions[name] != undefined
    }

    function doesFunctionExistWithTemplate(name, template){
        if(!doesFunctionExist(name)){
            return false
        }

        if(doesFunctionHaveVariations(name)){
            let match = false;

            for(let i = 0; i < functions[name].variations.length; i++){
                if(doesTemplateMatch(template, functions[name].variations[i].params)){
                    match = true;
                }
            }

            return match
        }else {
            return doesTemplateMatch(template, functions[name].params)
        }
    }

    function doesFunctionHaveVariations(name){
        if(!doesFunctionExist(name)){
            return false
        }

        return functions[name].variations != undefined
    }

    function doesFunctionSupportMolang(name){
        if(!doesFunctionExist(name)){
            return false
        }

        return functions[name].supports == 'molang'
    }

    function doesFunctionSupportEntity(name){
        if(!doesFunctionExist(name)){
            return false
        }

        return functions[name].supports == 'entity'
    }

    function doesTemplateMatch(params, template){
        let pTemplate = [];

        for(const i in params){
            pTemplate.push(params[i].token);
        }

        if(template.length != pTemplate.length){
            return false
        }

        for(const i in template){
            if(pTemplate[i] != template[i]){
                return false
            }
        }

        return true
    }

    function getFunction(name, params){
        if(!doesFunctionExist(name)){
            console.warn('Function does not exist: ' + name);
            return null
        }

        if(!doesFunctionExistWithTemplate(name, params)){
            console.warn('Function does not exist with template: ' + name);
            console.log(params);
            return null
        }

        if(doesFunctionHaveVariations(name)){
            for(const i in functions[name].variations){
                if(doesTemplateMatch(params, functions[name].variations[i].params)){
                    if(doesFunctionSupportMolang(name)){
                        return functions[name].variations[i].asMolang(params)
                    }

                    if(doesFunctionSupportEntity(name)){
                        return functions[name].variations[i].asEntity(params)
                    }
                }
            }
        }else {
            if(doesTemplateMatch(params, functions[name].params)){
                if(doesFunctionSupportMolang(name)){
                    return functions[name].asMolang(params)
                }

                if(doesFunctionSupportEntity(name)){
                    return functions[name].asEntity(params)
                }
            }
        }
    }

    function getIsFunctionDynamic(name, params){
        if(!doesFunctionExist(name)){
            console.warn('Function does not exist: ' + name);
            return null
        }

        if(!doesFunctionExistWithTemplate(name, params)){
            console.warn('Function does not exist with template: ' + name);
            return null
        }

        if(doesFunctionHaveVariations(name)){
            for(const i in functions[name].variations){
                if(doesTemplateMatch(params, functions[name].variations[i].params)){
                    return functions[name].variations[i].dynamic
                }
            }
        }else {
            if(doesTemplateMatch(params, functions[name].params)){
                return functions[name].dynamic
            }
        }
    }

    const operations = {
        '+': {
            params: [
                'INTEGER',
                'INTEGER'
            ],

            optimize(params){
                return {
                    value: (tokenToUseable(params[0]) + tokenToUseable(params[1])).toString(),
                    token: 'INTEGER',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} + ${variableToMolang(params[1]).value}`
            }
        },

        '-': {
            params: [
                'INTEGER',
                'INTEGER'
            ],

            optimize(params){
                return {
                    value: (tokenToUseable(params[0]) - tokenToUseable(params[1])).toString(),
                    token: 'INTEGER',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} - ${variableToMolang(params[1]).value}`
            }
        },

        '*': {
            params: [
                'INTEGER',
                'INTEGER'
            ],

            optimize(params){
                return {
                    value: (tokenToUseable(params[0]) * tokenToUseable(params[1])).toString(),
                    token: 'INTEGER',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} * ${variableToMolang(params[1]).value}`
            }
        },

        '/': {
            params: [
                'INTEGER',
                'INTEGER'
            ],

            optimize(params){
                return {
                    value: (tokenToUseable(params[0]) / tokenToUseable(params[1])).toString(),
                    token: 'FLOAT',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} / ${variableToMolang(params[1]).value}`
            }
        },
        
        '&&': {
            params: [
                'BOOLEAN',
                'BOOLEAN'
            ],

            optimize(params){
                return {
                    value: (tokenToUseable(params[0]) && tokenToUseable(params[1])).toString(),
                    token: 'BOOLEAN',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} && ${variableToMolang(params[1]).value}`
            }
        },

        '||': {
            params: [
                'BOOLEAN',
                'BOOLEAN'
            ],

            optimize(params){
                return {
                    value: (tokenToUseable(params[0]) || tokenToUseable(params[1])).toString(),
                    token: 'BOOLEAN',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} || ${variableToMolang(params[1]).value}`
            }
        },

        '==': {
            params: [
                'ANY',
                'ANY'
            ],

            optimize(params){
                if(params[0].token != params[1].token){
                    return {
                        value: 'false',
                        token: 'BOOLEAN',
                        line: params[0].line
                    }
                }

                return {
                    value: (tokenToUseable(params[0]) == tokenToUseable(params[1])).toString(),
                    token: 'BOOLEAN',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} == ${variableToMolang(params[1]).value}`
            }
        },

        '>': {
            params: [
                'INTEGER',
                'INTEGER'
            ],

            optimize(params){
                return {
                    value: (tokenToUseable(params[0]) > tokenToUseable(params[1])).toString(),
                    token: 'INTEGER',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} > ${variableToMolang(params[1]).value}`
            }
        },

        '<': {
            params: [
                'INTEGER',
                'INTEGER'
            ],

            optimize(params){
                return {
                    value: (tokenToUseable(params[0]) < tokenToUseable(params[1])).toString(),
                    token: 'INTEGER',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} < ${variableToMolang(params[1]).value}`
            }
        },

        '>=': {
            params: [
                'INTEGER',
                'INTEGER'
            ],

            optimize(params){
                return {
                    value: (tokenToUseable(params[0]) >= tokenToUseable(params[1])).toString(),
                    token: 'INTEGER',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} >= ${variableToMolang(params[1]).value}`
            }
        },

        '<=': {
            params: [
                'INTEGER',
                'INTEGER'
            ],

            optimize(params){
                return {
                    value: (tokenToUseable(params[0]) <= tokenToUseable(params[1])).toString(),
                    token: 'INTEGER',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `${variableToMolang(params[0]).value} <= ${variableToMolang(params[1]).value}`
            }
        },

        '!': {
            params: [
                'BOOLEAN'
            ],

            optimize(params){
                return {
                    value: (!tokenToUseable(params[0])).toString(),
                    token: 'BOOLEAN',
                    line: params[0].line
                }
            },

            toMolang(params){
                return `!${variableToMolang(params[0]).value}`
            }
        },
    };

    const dynamicDataTypes = [
        'MOLANG',
        'FLAG'
    ];

    function isOperationDynamic(operation){
        const params = operation.value.slice(1);

        for(const i in params){
            if(dynamicDataTypes.includes(params[i].token)){
                return true
            }

            if(params[i].token == 'CALL'){
                if(getIsFunctionDynamic(params[i].value[0].value)){
                    return true
                }

                if(isOperationDynamic(params[i].value)){
                    return true
                }
            }else if(params[i].token == 'EXPRESSION'){
                if(isOperationDynamic(params[i].value)){
                    return true
                }
            }
        }

        return false
    }

    function canDoOperation(operation){
        const params = operation.value.slice(1);

        const operationName = operation.value[0].value;

        if(operations[operationName].params.length != params.length){
            return false
        }

        let pParams = [];

        for(const i in params){
            pParams.push(params[i].token);
        }

        for(const i in pParams){
            if(pParams[i] != operations[operationName].params[i] && !operations[operationName].params[i] == 'ANY'){
                return false
            }
        }

        return true
    }

    function optimizeOperation(operation){
        const params = operation.value.slice(1);

        const operationName = operation.value[0].value;

        return operations[operationName].optimize(params)
    }

    function tokenToUseable(token){
        if(token.token == 'INTEGER'){
            return parseInt(token.value)
        }else if(token.token == 'BOOLEAN'){
            return token.value == 'true'
        }else if(token.token == 'STRING'){
            return token.value
        }else if(token.token == 'MOLANG'){
            return token.value
        }
    }

    let dynamicFlags = {};

    function setDynamicFlags(flags){
        dynamicFlags = flags;
    }

    function tokenToMolang(token){
        if(token.token == 'INTEGER'){
            return {
                value: token.value,
                token: 'MOLANG',
                line: token.line
            }
        }else if(token.token == 'BOOLEAN'){
            if(token.value == 'true'){
                return {
                    value: '1',
                    token: 'MOLANG',
                    line: token.line
                }
            }else {
                return {
                    value: '0',
                    token: 'MOLANG',
                    line: token.line
                }
            }
        }else if(token.token == 'STRING'){
            return {
                value: '\'' + token.value + '\'',
                token: 'MOLANG',
                line: token.line
            }
        }else if(token.token == 'MOLANG'){
            return {
                value: token.value,
                token: 'MOLANG',
                line: token.line
            }
        }else if(token.token == 'FLAG'){
            return {
                value: `q.actor_property('frw:${token.value}')`,
                token: 'MOLANG',
                line: token.line
            }
        }else if(token.token == 'NAME'){
            if(dynamicFlags[token.value]){
                return {
                    value: dynamicFlags[token.value],
                    token: 'MOLANG',
                    line: token.line
                }
            }
        }

        return {
            value: 'ERROR',
            token: 'MOLANG',
            line: token.line
        }
    }

    function variableToMolang(token){
        if(token.token == 'EXPRESSION'){
            const operation = token.value[0].value;
            const params = token.value.slice(1);

            token = {
                value: '(' + operations[operation].toMolang(params) + ')',
                token: 'MOLANG',
                line: token.line
            };        
        }else if(token.token == 'CALL'){
            const cName = token.value[0].value;
            const cParams = token.value.slice(1);

            token = {
                value: '(' + getFunction(cName, cParams) + ')',
                token: 'MOLANG',
                line: token.line
            };
        }else {
            token = {
                value: '(' + tokenToMolang(token).value + ')',
                token: 'MOLANG',
                line: token.line
            };
        }
        
        return token
    }

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

    function Compile(tree, config, source){
        //#region NOTE: Setup json values for editing
        let worldRuntime = source;

        let outAnimations = {};

        if(!worldRuntime['minecraft:entity'].description.animations){
            worldRuntime['minecraft:entity'].description.animations = {};
        }

        if(!worldRuntime['minecraft:entity'].description.properties){
            worldRuntime['minecraft:entity'].description.properties = {};
        }

        if(!worldRuntime['minecraft:entity'].events){
            worldRuntime['minecraft:entity'].events = {};
        }

        if(!worldRuntime['minecraft:entity'].description.scripts){
            worldRuntime['minecraft:entity'].description.scripts = {};
        }

        if(!worldRuntime['minecraft:entity'].description.scripts.animate){
            worldRuntime['minecraft:entity'].description.scripts.animate = [];
        }
        //#endregion

        //#region NOTE: Static Value Init - Index Dynamic Flags
        let dynamicFlags = {};

        function searchForDyncamicFlags(tree){
            for(let i = 0; i < tree.length; i++){
                if(tree[i].token == 'ASSIGN'){
                    if(tree[i].value[0].value == 'dyn' && tree[i].value[0].token == 'KEYWORD'){
                        if(dynamicFlags[tree[i].value[1].value]){
                            return new Error(`Dynamic flag '${tree[i].value[1].value}' already exists!`, tree[i].value[0].line)
                        }

                        if(tree[i].value[2].token != 'MOLANG'){
                            return new Error(`Dynamic flag '${tree[i].value[1].value}' can only be assigned to molang! It was assigned to '${tree[i].value[2].token}'.`, tree[i].value[0].line)
                        }

                        dynamicFlags[tree[i].value[1].value] = tree[i].value[2].value;
                    }
                }
            }
        }

        let deep = searchForDyncamicFlags(tree);

        if(deep instanceof Error){
            return deep
        }

        setDynamicFlags(dynamicFlags);
        //#endregion

        //#region NOTE: Dynamic Value Init - Index Flags
        let flags = {};

        function indexFlag(name){
            flags[name] = {};
        }

        function searchForFlags(tree){
            if(tree.token == 'EXPRESSION'){
                for(let i = 0; i < tree.value.length; i++){
                    if(tree.value[i].token == 'EXPRESSION'){
                        let deep = searchForFlags(tree.value[i]);

                        if(deep instanceof Error){
                            return deep
                        }
                    }else if(tree.value[i].token == 'FLAG'){
                        let deep = indexFlag(tree.value[i].value);

                        if(deep instanceof Error){
                            return deep
                        }
                    }
                }
            }else {
                for(let i = 0; i < tree.length; i++){
                    if(tree[i].token == 'ASSIGN'){
                        if(tree[i].value[0].token == 'FLAG'){
                            if(tree[i].value[1].token != 'BOOLEAN'){
                                return new Error(`fFlag '${tree[i].value[0].value}' can only be assigned to a boolean value! It was assigned to '${tree[i].value[1].token}'.`, tree[i].line)
                            }

                            let deep = indexFlag(tree[i].value[1].value);

                            if(deep instanceof Error){
                                return deep
                            }
                        }
                    }else if(tree[i].token == 'DEFINITION'){
                        let deep = searchForFlags(tree[i].value[1].value);

                        if(deep instanceof Error){
                            return deep
                        }
                    }else if(tree[i].token == 'IF'){
                        let deep = searchForFlags(tree[i].value[0]);

                        if(deep instanceof Error){
                            return deep
                        }

                        deep = searchForFlags(tree[i].value[1].value);

                        if(deep instanceof Error){
                            return deep
                        }
                    }else if(tree[i].token == 'DELAY'){
                        let deep = searchForFlags(tree[i].value[1].value);

                        if(deep instanceof Error){
                            return deep
                        }
                    }else if(tree[i].token == 'CALL'){
                        let params = tree[i].value.slice(1);

                        for(let j = 0; j < params.length; j++){
                            if(params[j].token == 'FLAG'){
                                indexFlag(params[j].value);
                            }else if(params[j].token == 'EXPRESSION'){
                                let deep = searchForFlags(params[j]);

                                if(deep instanceof Error){
                                    return deep
                                }
                            }
                        }
                    }
                }
            }
        }

        deep = searchForFlags(tree);

        if(deep instanceof Error){
            return deep
        }
        //#endregion
        
        //#region NOTE: Dynamic Value Init - Index Functions
        let functions = {};

        function searchForFunctions(tree){
            for(let i = 0; i < tree.length; i++){
                if(tree[i].token == 'DEFINITION'){
                    if(functions[tree[i].value[0].value]){
                        return new Error(`Function '${tree[i].value[1].value}' already exists!`, tree[i].line)
                    }

                    functions[tree[i].value[0].value] = tree[i].value[1].value;
                }
            }
        }

        deep = searchForFunctions(tree);

        if(deep instanceof Error){
            return deep
        }
        //#endregion

        //#region NOTE: Expression Optimization
        function optimizeExpression(expression){
            const params = expression.value.slice(1);

            for(let i = 0; i < params.length; i++){
                if(params[i].token == 'EXPRESSION'){
                    params[i] = optimizeExpression(params[i]);

                    if(params[i] instanceof Error){
                        return params[i]
                    }

                    expression.value[i + 1] = params[i];
                }else if(params[i].token == 'CALL'){
                    const cParams = params[i].value.slice(1);

                    for(let j = 0; j < cParams.length; j++){
                        if(cParams[j].token == 'EXPRESSION'){
                            cParams[j] = optimizeExpression(cParams[j]);

                            if(cParams[j] instanceof Error){
                                return cParams[j] 
                            }
            
                            expression.value[i + 1].value[j + 1] = cParams[j]; 
                        }
                    }
                }
            }

            let canBeOptimized = true;

            for(let i = 0; i < params.length; i++){
                if(params[i].token == 'EXPRESSION'){
                    canBeOptimized = false;
                }
            }

            if(!canBeOptimized) return expression

            if(isOperationDynamic(expression)) return expression

            if(!canDoOperation(expression)){
                let pTypes = [];

                for(let i = 0; i < params.length; i++){
                    pTypes.push(params[i].token);
                }

                return new Error(`Can not do operation ${expression.value[0].value} between types ${pTypes.toString()}!`, expression.value[0].line)
            }

            return optimizeOperation(expression)
        }

        function searchForExpressions(tree){
            for(let i = 0; i < tree.length; i++){
                if(tree[i].token == 'ASSIGN'){
                    if(tree[i].value[0].value == 'dyn' && tree[i].value[1].token == 'KEYWORD');else {
                        if(tree[i].value[1].token == 'EXPRESSION'){
                            let deep = optimizeExpression(tree[i].value[1]);

                            if(deep instanceof Error){
                                return deep
                            }

                            tree[i].value[1] = deep;
                        }
                    }
                }else if(tree[i].token == 'DEFINITION'){
                    let deep = searchForExpressions(tree[i].value[1].value);

                    if(deep instanceof Error){
                        return deep
                    }
                }else if(tree[i].token == 'IF'){
                    let deep = undefined;

                    if(tree[i].value[0].token == 'EXPRESSION'){
                        deep = optimizeExpression(tree[i].value[0]);

                        if(deep instanceof Error){
                            return deep
                        }

                        tree[i].value[0] = deep;
                    }

                    deep = searchForExpressions(tree[i].value[1].value);

                    if(deep instanceof Error){
                        return deep
                    }
                }else if(tree[i].token == 'DELAY'){
                    let deep = undefined;

                    if(tree[i].value[0].token == 'EXPRESSION'){
                        optimizeExpression(tree[i].value[0]);

                        if(deep instanceof Error){
                            return deep
                        }

                        tree[i].value[0] = deep;
                    }

                    deep = searchForExpressions(tree[i].value[1].value);

                    if(deep instanceof Error){
                        return deep
                    }
                }else if(tree[i].token == 'CALL'){
                    let params = tree[i].value.slice(1);

                    for(let j = 0; j < params.length; j++){
                        if(params[j].token == 'EXPRESSION'){
                            let deep = optimizeExpression(params[j]);

                            if(deep instanceof Error){
                                return deep
                            }

                            tree[i].value[j + 1] = deep;
                        }
                    }
                }
            }
        }

        deep = searchForExpressions(tree);

        if(deep instanceof Error){
            return deep
        }

        //#endregion

        //#region NOTE: Index Dynamic Values
        let dynamicValues = {};

        function indexDynamicValues(name, expression){
            dynamicValues[name] = expression;

            return {
                value: name,
                token: 'DYNAMIC VALUE'
            }
        }

        function searchForDyncamicValues(tree){
            for(let i = 0; i < tree.length; i++){
                if(tree[i].token == 'DEFINITION'){
                    let deep = searchForDyncamicValues(tree[i].value[1].value);

                    if(deep instanceof Error){
                        return deep
                    }
                }else if(tree[i].token == 'IF'){
                    tree[i].value[0] = indexDynamicValues(uuidv4(), tree[i].value[0]);

                    deep = searchForDyncamicValues(tree[i].value[1].value);

                    if(deep instanceof Error){
                        return deep
                    }
                }else if(tree[i].token == 'DELAY'){
                    let deep = searchForDyncamicValues(tree[i].value[1].value);

                    if(deep instanceof Error){
                        return deep
                    }
                }
            }
        }

        deep = searchForDyncamicValues(tree);

        if(deep instanceof Error){
            return deep
        }

        const dynamicFlagNames = Object.keys(dynamicFlags);

        for(const i in dynamicFlagNames){
            const name = dynamicFlagNames[i];

            if(!(name in dynamicValues)){
                dynamicValues[name] = {
                    value: dynamicFlags[name],
                    token: 'MOLANG'
                };
            }
        }
        //#endregion
        
        //#region NOTE: Compile Dynamic Values
        const dynamicValueNames = Object.keys(dynamicValues);
        
        for(const i in dynamicValueNames){
            const name = dynamicValueNames[i];

            outAnimations['animation.firework.backend.' + name] = {
                loop: true,
                timeline: {
                    '0.0': [
                        `/tag @s add frwb_dv_${name}`
                    ]
                },
                animation_length: 0.001
            };

            outAnimations['animation.firework.backend.' + name + '.inverse'] = {
                loop: true,
                timeline: {
                    '0.0': [
                        `/tag @s remove frwb_dv_${name}`
                    ]
                },
                animation_length: 0.001
            };

            worldRuntime['minecraft:entity'].description.animations[name] = 'animation.firework.backend.' + name;
            worldRuntime['minecraft:entity'].description.animations[name + '_inverse'] = 'animation.firework.backend.' + name + '.inverse';

            let scriptData = {};
            
            scriptData[name] = variableToMolang(dynamicValues[name]).value;

            worldRuntime['minecraft:entity'].description.scripts.animate.push(scriptData);

            scriptData = {};

            scriptData[name + '_inverse'] = '!(' + variableToMolang(dynamicValues[name]).value + ')';

            worldRuntime['minecraft:entity'].description.scripts.animate.push(scriptData);
        }
        //#endregion

        //#region NOTE: Compile Flags
        const flagNames = Object.keys(flags);

        for(const i in flagNames){
            const name = flagNames[i];

            let eventData = {
                set_actor_property: {},
                run_command: {
                    command: [
                        `tag @s add frw_${name}`
                    ]
                }
            };
        
            eventData.set_actor_property['frw:' + name] = 1;

            worldRuntime['minecraft:entity'].events['frw_' + name + '_true'] = eventData;

            eventData = {
                set_actor_property: {},
                run_command: {
                    command: [
                        `tag @s remove frw_${name}`
                    ]
                }
            };
        
            eventData.set_actor_property['frw:' + name] = 0;

            worldRuntime['minecraft:entity'].events['frw_' + name + '_false'] = eventData;

            worldRuntime['minecraft:entity'].description.properties['frw:' + name] = {
                values: [
                    0,
                    1
                ]
            };
        }
        //#endregion
        
        //#region NOTE: Compile Code Blocks
        let delayChannelTicks = [];
        
        function compileCodeBlock(name, value){
            let commands = [];

            let eventData = {
                run_command: {
                    command: []
                }
            };

            for(let i = 0; i < value.length; i++){
                if(value[i].token == 'CALL'){
                    const name = value[i].value[0].value;
                    const params = value[i].value.slice(1);

                    if(!doesFunctionExist(name) && !functionNames.includes(name)){
                        return new Error(`Function ${name} does not exist!`, value[i].line)
                    }

                    if(doesFunctionExist(name)){
                        if(!doesFunctionExistWithTemplate(name, params)){
                            return new Error(`Function ${name} does not exist with template!`, value[i].line)
                        }

                        let entity = getFunction(name, params);

                        for(let j = 0; j < entity.commands.length; j++){
                            commands.push(entity.commands[j]);
                        }
                    } else {
                        commands.push(`event entity @s frw_${name}`);
                    }
                }else if(value[i].token == 'ASSIGN'){
                    if(value[i].value[0].value == 'true'){
                        commands.push(`event entity @s frw_${name}_true`);
                    }else {
                        commands.push(`event entity @s frw_${name}_false`);
                    }
                }else if(value[i].token == 'IF'){
                    const valueID = value[i].value[0].value;

                    compileCodeBlock('frwb_' + valueID, value[i].value[1].value);

                    commands.push(`event entity @s[tag=frwb_dv_${valueID}] frw_frwb_${valueID}`);
                }else if(value[i].token == 'DELAY'){
                    const delayID = uuidv4();
                    const delay = tokenToUseable(value[i].value[0]);

                    compileCodeBlock('frwb_delay_result_' + delayID, value[i].value[1].value);

                    let triggerCommands = [];

                    for(let j = 0; j < 3; j++){
                        triggerCommands.push(`event entity @s[tag=!frwb_delay_added] frwb_delay_trigger_channel_${j}_${delayID}`);

                        worldRuntime['minecraft:entity'].events[`frwb_delay_trigger_channel_${j}_${delayID}`] = {
                            run_command: {
                                command: [
                                    'tag @s add frwb_delay_added',
                                    `tag @s add frwb_delay_tick_channel_${j}_0_${delayID}`
                                ]
                            }
                        };

                        for(let u = delay; u > 0; u--){
                            if(u == delay){
                                delayChannelTicks.push(`event entity @s[tag=frwb_delay_tick_channel_${j}_${u - 1}_${delayID}] frwb_delay_tick_channel_${j}_${u}_${delayID}`);
                            
                                worldRuntime['minecraft:entity'].events[`frwb_delay_tick_channel_${j}_${u}_${delayID}`] = {
                                    run_command: {
                                        command: [
                                            `tag @s remove frwb_delay_tick_channel_${j}_${u - 1}_${delayID}`,
                                            `event entity @s frw_frwb_delay_result_${delayID}`
                                        ]
                                    }
                                };

                                continue
                            }

                            delayChannelTicks.push(`event entity @s[tag=frwb_delay_tick_channel_${j}_${u - 1}_${delayID}] frwb_delay_tick_channel_${j}_${u}_${delayID}`);
                            
                            worldRuntime['minecraft:entity'].events[`frwb_delay_tick_channel_${j}_${u}_${delayID}`] = {
                                run_command: {
                                    command: [
                                        `tag @s remove frwb_delay_tick_channel_${j}_${u - 1}_${delayID}`,
                                        `tag @s add frwb_delay_tick_channel_${j}_${u}_${delayID}`
                                    ]
                                }
                            };
                        }
                    }

                    triggerCommands.push('tag @s remove frwb_delay_added');

                    worldRuntime['minecraft:entity'].events['frwb_delay_trigger_' + delayID] = {
                        run_command: {
                            command: triggerCommands
                        }
                    };

                    commands.push(`event entity @s frwb_delay_trigger_${delayID}`);
                }
            }
        
            eventData.run_command.command = commands;

            worldRuntime['minecraft:entity'].events['frw_' + name] = eventData;
        }
        
        const functionNames = Object.keys(functions);

        for(const i in functionNames){
            const name = functionNames[i];

            compileCodeBlock(name, functions[name]);
        }

        worldRuntime['minecraft:entity'].events.frwb_delay = {
            run_command: {
                command: delayChannelTicks
            }
        };
        //#endregion

        return {
            animations: outAnimations,
            entity: worldRuntime
        }
    }

    function splitLines(tokens){
        let lineCount = 1;

        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];

            tokens[i].line = lineCount;

            if(token.token == 'NEWLINE' && token.value == '\n'){
                lineCount++;
            }
        }

        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];

            const nextToken = tokens[i + 1];

            if(token.token == 'NEWLINE' && nextToken && nextToken.token == 'NEWLINE'){
                tokens.splice(i, 1);
                tokens[i].value = '\n';

                i--;
            }
        }

        let lines = [];

        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];

            if(token.token == 'NEWLINE'){
                lines.push(tokens.slice(0, i));

                tokens.splice(0, i + 1);

                i = 0;
            }
        }

        lines.push(tokens.slice(0, tokens.length));

        return lines
    }

    function buildCodeBlocks(tokens){
        let openPaths = [];

        let firstBracketLine = -1;

        for(let x = 0; x < tokens.length; x++){
            for(let y = 0; y < tokens[x].length; y++){
                if(tokens[x][y].value == '{' && tokens[x][y].token == 'SYMBOL'){
                    if(firstBracketLine == -1){
                        firstBracketLine = tokens[x][y].line;
                    }

                    openPaths.push({ x: x, y: y });
                }

                if(tokens[x][y].value == '}' && tokens[x][y].token == 'SYMBOL'){
                    let openPath = openPaths.pop();

                    if(!openPath){
                        return new Error('Unexpected }!', tokens[x][y].line)
                    }

                    let inBlockLines = [];

                    for(let i = openPath.x; i <= x; i++){
                        if(i == openPath.x){
                            inBlockLines.push(tokens[i].slice(openPath.y + 1, tokens[i].length));
                        }else if(i == x){
                            inBlockLines.push(tokens[i].slice(0, y));
                        }else {
                            inBlockLines.push(tokens[i]);
                        }
                    }

                    for(let i = 0; i < inBlockLines.length; i++){
                        if(inBlockLines[i].length == 0){
                            inBlockLines.splice(i, 1);
                            i--;
                        }
                    }

                    tokens[openPath.x].splice(openPath.y, tokens[openPath.x].length, { value: inBlockLines, token: 'BLOCK', line: tokens[x][y].line });

                    tokens[x].splice(0, y + 1);

                    if(tokens[x].length == 0){
                        tokens.splice(x, 1);
                    }

                    if(x - openPath.x > 1){
                        tokens.splice(openPath.x + 1, x - openPath.x - 1);
                    }

                    x = openPath.x;
                }
            }
        }

        if(openPaths.length > 0){
          return new Error('Unclosed \'{\'!', firstBracketLine)
        }

        return tokens
    }

    function buildCompoundTypes(tokens){
        for(let l = 0; l < tokens.length; l++){
            let inString = false;
            let inStringIndex = -1;

            //Go Deeper Into Blocks
            for(let i = 0; i < tokens[l].length; i++){
                if(tokens[l][i].token == 'BLOCK'){
                    const deep = buildCompoundTypes(tokens[l][i].value);

                    if(deep instanceof Error){
                      return deep
                    }

                    tokens[l][i].value = deep;
                }
            }

            let removed = false;

            let lastStringLine;

            //Remove Whitespace and Create Strings
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];

                if(token.token == 'SYMBOL' && (token.value == '"' || token.value == "'")){
                    inString = !inString;

                    if(inString){
                        inStringIndex = i;
                        lastStringLine = token.line;
                    }else {            
                        let tokensInString = tokens[l].slice(inStringIndex + 1, i);

                        let resultString = '';

                        for(let j = 0; j < tokensInString.length; j++){
                            resultString += tokensInString[j].value;
                        }

                        tokens[l].splice(inStringIndex, i - inStringIndex + 1, { value: resultString, token: 'STRING', line: token.line });

                        i -= i - inStringIndex;
                    }
                }
                
                if(token.token == 'WHITESPACE' && !inString){
                    tokens[l].splice(i, 1);

                    i--;
                }

                if(tokens[l].length == 0){
                    tokens.splice(l, 1);

                    l--;

                    removed = true;

                    break
                }
            }

            if(removed){
                continue
            }

            if(inString){
              return new Error('Unclosed string!', lastStringLine)
            }

            //Combine Numbers
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];

                if(token.token == 'INTEGER'){
                    let nextToken = tokens[l][i + 1];

                    if(nextToken && nextToken.token == 'INTEGER'){
                        tokens[l].splice(i, 2, { value: token.value + nextToken.value, token: 'INTEGER', line: token.line });

                        i--;
                    }
                }
            }

            //Build Flags
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const prevToken = tokens[l][i - 1];

                if(token.token == 'NAME' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '$'){
                    tokens[l].splice(i - 1, 2, { value: token.value, token: 'FLAG', line: token.line });

                    i--;
                }
            }

            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];

                if(token.token == 'SYMBOL' && token.value == '$'){
                    return new Error('Unexpected symbol \'$\'!', token.line)
                }
            }

            //Build Molang
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const prevToken = tokens[l][i - 1];

                if(token.token == 'STRING' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '?'){
                    tokens[l].splice(i - 1, 2, { value: token.value, token: 'MOLANG', line: token.line });

                    i--;
                }
            }

            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];

                if(token.token == 'SYMBOL' && token.value == '?'){
                    return new Error('Unexpected symbol \'?\'!', token.line)
                }
            }

            //Build Arrows
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const prevToken = tokens[l][i - 1];

                if(token.token == 'SYMBOL' && token.value == '>' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '='){
                    tokens[l].splice(i - 1, 2, { value: '=>', token: 'ARROW', line: token.line });

                    i--;
                }
            }

            //Build Empty Function Calls
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const nextToken = tokens[l][i + 1];
                const nextNextToken = tokens[l][i + 2];

                if(token.token == 'NAME' && nextToken && nextToken.value == '(' && nextNextToken && nextNextToken.value == ')'){
                    tokens[l].splice(i, 3, { value: [token], token: 'CALL', line: token.line });
                }
            }
        }

        return tokens
    }

    function buildExpressions(tokens){
        for(let l = 0; l < tokens.length; l++){
            //Go Deeper Into Blocks
            for(let i = 0; i < tokens[l].length; i++){
                if(tokens[l][i].token == 'BLOCK'){
                    const deep = buildExpressions(tokens[l][i].value);

                    if(deep instanceof Error){
                        return deep
                    }

                    tokens[l][i].value = deep;
                }
            }

            //Build Expression
            for(let i = 0; i < tokens[l].length; i++){
                const deep = buildExpressionsSingle(tokens[l]);

                if(deep instanceof Error){
                    return deep
                }

                tokens[l] = deep;
            }
        }

        return tokens
    }

    function buildExpressionsSingle(tokens){
        //Create Parantheses Groups
        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];

            if(token.token == 'SYMBOL' && token.value == '('){
                let prevToken = tokens[i - 1];

                if(!(prevToken && (prevToken.token == 'NAME' || prevToken.token == 'KEYWORD'))){
                    let found = 0;
                    let endingIndex = -1;

                    for(let j = i + 1; j < tokens.length; j++){
                        const nextToken = tokens[j];

                        if(nextToken.token == 'SYMBOL' && nextToken.value == '('){            
                            found++;
                        }else if(nextToken.token == 'SYMBOL' && nextToken.value == ')'){
                            if(found == 0){
                                endingIndex = j;
                                break
                            }
                            
                            found--;
                        }
                    }

                    if(found > 0 || endingIndex == -1){
                        return new Error('Unclosed parantheses!', token.line)
                    }

                    let insideTokens = tokens.slice(i + 1, endingIndex);

                    const paramOut = buildParamsSingle(insideTokens);

                    if(paramOut instanceof Error){
                        return paramOut
                    }

                    const deep = buildExpressionsSingle(paramOut);

                    if(deep instanceof Error){
                        return deep
                    }

                    if(deep.length != 1){
                        return new Error('Unexpected symbol (01) ' + deep[0].value, deep[0].line)
                    }

                    tokens.splice(i, endingIndex - i + 1, deep[0]);

                    i--;
                }
            }
        }

        //Create Expressions * and /
        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];

            if(token.token == 'SYMBOL' && (token.value == '*' || token.value == '/')){
                let nextToken = tokens[i + 1];
                let prevToken = tokens[i - 1];

                if(prevToken && nextToken){
                    if(!(nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                        return new Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`, token.line)
                    }

                    tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION', line: token.line });

                    i--;
                }
            }
        }

        //Create Expressions + and -
        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];

            if(token.token == 'SYMBOL' && (token.value == '+' || token.value == '-')){
                let nextToken = tokens[i + 1];
                let prevToken = tokens[i - 1];

                if(prevToken && nextToken){
                    if(!(nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                        return new Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`, token.line)
                    }
                    
                    tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION', line: token.line });

                    i--;
                }
            }
        }

        //Create Expressions !
        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];

            if(token.token == 'SYMBOL' && token.value == '!'){
                let nextToken = tokens[i + 1];

                if(nextToken){
                    if(!(nextToken.token == 'EXPRESSION' || nextToken.token == 'FLAG' || nextToken.token == 'BOOLEAN' || nextToken.token == 'MOLANG')){
                        return new Error(`Can not do operation '${token.value}' with '${nextToken.token}'!`, token.line)
                    }

                    tokens.splice(i, 2, { value: [token, nextToken], token: 'EXPRESSION', line: token.line });
                }
            }
        }

        //Create Expressions == > < >= <=
        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];
            const nextToken = tokens[i + 1];

            if(token.token == 'SYMBOL' && (token.value == '=' || token.value == '>' || token.value == '<')){
                let prevToken = tokens[i - 1];

                if(prevToken && nextToken){
                    if(nextToken.token == 'SYMBOL' && nextToken.value == '='){
                        let nextNextToken = tokens[i + 2];

                        if(token.value == '>' || token.value == '<'){
                            if(!(nextNextToken.token == 'INTEGER' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'NAME') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'NAME')){
                                return new Error(`Can not do operation '${token.value + nextToken.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`, token.line)
                            }
                            
                            const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' };
                            
                            tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION', line: token.line });

                            i--;
                        }else {
                            if(!(nextNextToken.token == 'INTEGER' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'FLAG' || nextNextToken.token == 'MOLANG' || nextNextToken.token == 'NAME') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'BOOLEAN' || prevToken.token == 'FLAG' || prevToken.token == 'MOLANG' || prevToken.token == 'NAME')){
                                return new Error(`Can not do operation '${token.value + nextToken.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`, token.line)
                            }

                            const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' };

                            tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION', line: token.line });

                            i--;
                        }
                    }else if(token.value == '>' || token.value == '<'){
                        if(!(nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION' || nextNextToken.token == 'NAME') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'NAME')){
                            return new Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`, token.line)
                        }

                        tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION', line: token.line });

                        i--;
                    }
                }
            }
        }

        //Create Expressions || and &&
        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];
            const nextToken = tokens[i + 1];

            if(token.token == 'SYMBOL' && nextToken && nextToken.token == 'SYMBOL' && ((token.value == '|' && nextToken.value == '|') || (token.value == '&' && nextToken.value == '&'))){    
                let nextNextToken = tokens[i + 2];
                let prevToken = tokens[i - 1];

                if(prevToken && nextNextToken){
                    if(!(nextNextToken.token == 'FLAG' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'MOLANG' || nextNextToken.token == 'CALL' || nextNextToken.token == 'NAME') || !(prevToken.token == 'FLAG' || prevToken.token == 'EXPRESSION' || prevToken.token == 'BOOLEAN' || prevToken.token == 'MOLANG' || prevToken.token == 'CALL' || prevToken.token == 'NAME')){
                        return new Error(`Can not do operation '${token.value + nextToken.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`, token.line)
                    }

                    const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' };
                    
                    tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION', line: token.line });

                    i--;
                }
            }
        }

        return tokens
    }

    function buildParamsSingle(tokens){
        //Go Into Complex Function Calls
        for(let i = 0; i < tokens.length; i++){
            const token = tokens[i];

            if(token.token == 'SYMBOL' && token.value == '('){
                const prevToken = tokens[i - 1];

                if(prevToken && prevToken.token == 'NAME'){
                    for(let j = i + 1; j < tokens.length; j++){
                        const otherToken = tokens[j];

                        if(otherToken.token == 'SYMBOL' && otherToken.value == '('){
                            const otherPrevToken = tokens[j - 1];

                            if(otherPrevToken && otherPrevToken.token == 'NAME'){
                                let opensFound = 0;

                                let endIndex = -1;

                                for(let u = j + 1; u < tokens.length; u++){
                                    const otherOtherToken = tokens[u];
                
                                    if(otherOtherToken.token == 'SYMBOL' && otherOtherToken.value == '('){
                                        opensFound++;
                                    }

                                    if(otherOtherToken.token == 'SYMBOL' && otherOtherToken.value == ')'){
                                        if(opensFound == 0){
                                            endIndex = u;

                                            break
                                        }else {
                                            opensFound--;
                                        }
                                    }
                                }

                                if(opensFound != 0 || endIndex == -1){
                                    return new Error('Unclosed parantheses!', token.line)
                                }

                                let parsed = buildParamsSingle(tokens.slice(j - 1, endIndex + 1));

                                if(parsed instanceof Error){
                                    return parsed
                                }

                                if(parsed.length != 1){
                                    return new Error('Unexpected symbol (02) ' + parsed[0].value, parsed[0].line)
                                }

                                tokens.splice(j - 1, endIndex - j + 2, parsed[0]);
                            }
                        }
                    }

                    let opensFound = 0;

                    let endIndex = -1;

                    let openFoundLine = -1;

                    for(let u = i + 1; u < tokens.length; u++){
                        const otherOtherToken = tokens[u];

                        if(otherOtherToken.token == 'SYMBOL' && otherOtherToken.value == '('){
                            if(openFoundLine == -1){
                                openFoundLine = otherOtherToken.line;
                            }

                            opensFound++;
                        }

                        if(otherOtherToken.token == 'SYMBOL' && otherOtherToken.value == ')'){
                            if(opensFound == 0){
                                endIndex = u;

                                break
                            }else {
                                opensFound--;
                            }
                        }
                    }

                    if(openFoundLine == -1){
                        openFoundLine = token.line;
                    }

                    if(opensFound != 0 || endIndex == -1){
                        return new Error('Unclosed parantheses!', openFoundLine)
                    }

                    //Build Expressions Between Commas
                    let groups = [];
                    let lastGroupPos = i;

                    for(let k = i; k < endIndex; k++){
                        const goalToken = tokens[k];

                        if(goalToken.token == 'SYMBOL' && goalToken.value == ','){
                            let group = buildExpressionsSingle(tokens.slice(lastGroupPos + 1, k));

                            if(group instanceof Error){
                                return parsed
                            }

                            if(group.length != 1){
                                return new Error('Unexpected symbol (03) ' + group[0].value, goalToken.line)
                            }

                            groups.push(group[0]);

                            lastGroupPos = k;
                        }
                    }

                    let group = buildExpressionsSingle(tokens.slice(lastGroupPos + 1, endIndex));

                    if(group instanceof Error){
                        return parsed
                    }

                    if(group.length != 1){
                        return new Error('Unexpected symbol (04) ' + group[0].value, group[0].line)
                    }

                    groups.push(group[0]);

                    groups.unshift(prevToken);

                    tokens.splice(i - 1, endIndex - i + 2, { value: groups, token: 'CALL' });
                }
            }
        }

        return tokens
    }

    function buildParams(tokens){
        for(let l = 0; l < tokens.length; l++){
            //Go Deeper Into Blocks
            for(let i = 0; i < tokens[l].length; i++){
                if(tokens[l][i].token == 'BLOCK'){
                    const deep = buildParams(tokens[l][i].value);

                    if(deep instanceof Error){
                        return deep
                    }

                    tokens[l][i].value = deep;
                }
            }

            const deepOut = buildParamsSingle(tokens[l]);

            if(deepOut instanceof Error){
                return deepOut
            }

            tokens[l] = deepOut;
        }

        return tokens
    }

    function buildAsignments(tokens){
        for(let l = 0; l < tokens.length; l++){
            //Build Asignments
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const nextToken = tokens[l][i + 1];
                const nextNextToken = tokens[l][i + 2];
                const nextNextNextToken = tokens[l][i + 3];

                if(token.token == 'KEYWORD' && token.value == 'dyn' && nextToken && nextToken.token == 'NAME' && nextNextToken && nextNextToken.token == 'SYMBOL' && nextNextToken.value == '=' && nextNextNextToken){
                    if(!(nextNextNextToken.token == 'MOLANG' || nextNextNextToken.token == 'EXPRESSION')){
                        return new Error(`Dynamic can't be assigned to ${nextNextNextToken.token}!`, token.line)
                    }

                    tokens[l].splice(i, 4, { value: [token, nextToken, nextNextNextToken], token: 'ASSIGN', line: token.line });
                }
            }
        }

        return tokens
    }

    function buildIfAndDelay(tokens){
        for(let l = 0; l < tokens.length; l++){
            //Go Deeper Into Blocks
            for(let i = 0; i < tokens[l].length; i++){
                if(tokens[l][i].token == 'BLOCK'){
                    const deep = buildIfAndDelay(tokens[l][i].value);

                    if(deep instanceof Error){
                        return deep
                    }

                    tokens[l][i].value = deep;
                }
            }

            //Build Ifs And Delays
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const nextToken = tokens[l][i + 1];
                const nextNextToken = tokens[l][i + 2];
                const nextNextNextToken = tokens[l][i + 3];
                const nextNextNextNextToken = tokens[l][i + 4];
                const nextNextNextNextNextToken = tokens[l][i + 5];

                if(token.token == 'KEYWORD' && token.value == 'if' && nextToken && nextToken.token == 'SYMBOL' && nextToken.value == '(' && nextNextToken && nextNextNextToken && nextNextNextToken.token == 'SYMBOL' && nextNextNextToken.value == ')' && nextNextNextNextToken && nextNextNextNextToken.token == 'ARROW' && nextNextNextNextNextToken && nextNextNextNextNextToken.token == 'BLOCK'){
                    if(!(nextNextToken.token == 'FLAG' || nextNextToken.token == 'NAME' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'MOLANG' || nextNextToken.token == 'CALL')){
                        return new Error(`If condition can't be ${nextNextToken.token}!`, token.line)
                    }
                    
                    for(let j = 0; j < nextNextNextNextNextToken.value.length; j++){
                        nextNextNextNextNextToken.value[j] = nextNextNextNextNextToken.value[j][0];
                    }
                    
                    tokens[l].splice(i, 6, { value: [nextNextToken, nextNextNextNextNextToken], token: 'IF', line: token.line });
                }
            }

            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const nextToken = tokens[l][i + 1];
                const nextNextToken = tokens[l][i + 2];
                const nextNextNextToken = tokens[l][i + 3];
                const nextNextNextNextToken = tokens[l][i + 4];
                const nextNextNextNextNextToken = tokens[l][i + 5];

                if(token.token == 'KEYWORD' && token.value == 'delay' && nextToken && nextToken.token == 'SYMBOL' && nextToken.value == '(' && nextNextToken && nextNextNextToken && nextNextNextToken.token == 'SYMBOL' && nextNextNextToken.value == ')' && nextNextNextNextToken && nextNextNextNextToken.token == 'ARROW' && nextNextNextNextNextToken && nextNextNextNextNextToken.token == 'BLOCK'){
                    if(nextNextToken.token != 'INTEGER'){
                        return new Error(`Delay must be an integer!`, token.line)
                    }
                    
                    for(let j = 0; j < nextNextNextNextNextToken.value.length; j++){
                        nextNextNextNextNextToken.value[j] = nextNextNextNextNextToken.value[j][0];
                    }
                    
                    tokens[l].splice(i, 6, { value: [nextNextToken, nextNextNextNextNextToken], token: 'DELAY', line: token.line });
                }
            }
        }

        return tokens
    }

    function buildFunctions(tokens){
        for(let l = 0; l < tokens.length; l++){
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const nextToken = tokens[l][i + 1];
                const nextNextToken = tokens[l][i + 2];
                const nextNextNextToken = tokens[l][i + 3];

                if(token.token == 'KEYWORD' && token.value == 'func' && nextToken && nextToken.token == 'NAME' && nextNextToken && nextNextToken.token == 'ARROW' && nextNextNextToken && nextNextNextToken.token == 'BLOCK'){
                    for(let j = 0; j <  nextNextNextToken.value.length; j++){
                        nextNextNextToken.value[j] = nextNextNextToken.value[j][0];
                    }
                    
                    tokens[l].splice(i, 6, { value: [nextToken, nextNextNextToken], token: 'DEFINITION', line: token.line });
                }
            }
        }

        return tokens
    }

    function buildFlagAssignments(tokens){
        for(let l = 0; l < tokens.length; l++){
            //Go Deeper Into Blocks
            for(let i = 0; i < tokens[l].length; i++){
                if(tokens[l][i].token == 'BLOCK'){
                    let deep = buildFlagAssignments(tokens[l][i].value);

                    if(deep instanceof Error){
                        return deep
                    }

                    tokens[l][i].value = deep;
                }
            }

            //Build Flag Asignments
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const nextToken = tokens[l][i + 1];
                const nextNextToken = tokens[l][i + 2];

                if(token.token == 'FLAG' && nextToken && nextToken.token == 'SYMBOL' && nextToken.value == '=' && nextNextToken){
                    if(nextNextToken.token != 'BOOLEAN'){
                        return new Error('Can\'t assign flag to ' + nextNextToken.token + '!', token.line)
                    }
                    
                    tokens[l].splice(i, 3, { value: [token, nextNextToken], token: 'ASSIGN', line: token.line });
                }
            }
        }

        return tokens
    }

    function GenerateETree(tokens){
        tokens = splitLines(tokens);

        tokens = buildCodeBlocks(tokens);

        if(tokens instanceof Error){
          return tokens
        }

        tokens = buildCompoundTypes(tokens);

        if(tokens instanceof Error){
          return tokens
        }

        let allEmpty = true;

        for(let i = 0; i < tokens.length; i++){
            if(tokens[i].length != 0){
                allEmpty = false;
            }
        }

        if(allEmpty){
            return new Error('File was empty!', 0)
        }

        tokens = buildParams(tokens);

        if(tokens instanceof Error){
            return tokens
        }

        tokens = buildExpressions(tokens);

        if(tokens instanceof Error){
            return tokens
        }

        tokens = buildFlagAssignments(tokens);

        if(tokens instanceof Error){
            return tokens
        }

        tokens = buildAsignments(tokens);

        if(tokens instanceof Error){
            return tokens
        }

        tokens = buildIfAndDelay(tokens);

        if(tokens instanceof Error){
            return tokens
        }

        tokens = buildFunctions(tokens);

        if(tokens instanceof Error){
          return tokens
        }

        for(let l = 0; l < tokens.length; l++){
            if(tokens[l].length != 1){
                return new Error('Unexpected symbol (05) ' + tokens[l][0].value, tokens[l][0].line)
            }else if(tokens[l].length == 0){
                tokens[l].splice(l, 1);
                l--;
            }else {
                tokens[l] = tokens[l][0];
            }
        }

        return tokens
    }

    function isInteger(str){
        if(typeof str != 'string') return false

        if(str.length == 0) return false

        if(str.includes('.')) return false

        if(str.includes(' ')) return false

        if(str.includes('\n')) return false

        if(str.includes('\r')) return false

        return Number.isInteger(Number(str))
    }

    const whitespace = [
        ' ',
        '\t',
    ];

    const symbols = [
        '(',
        ')',
        '+',
        '-',
        '*',
        '/',
        '=',
        '<',
        '>',
        '!',
        '&',
        '|',
        ',',
        '?',
        '!',
        '$',
        '"',
        '{',
        '}',
    ];

    const keywords = [
        'if',
        'dyn',
        'func',
        'delay'
    ];

    function Tokenize(input) {
        let tokens = [];

        let readStart = 0;

        let lastUnkown = -1;

        while(readStart < input.length) {
            let found = false;
            let foundAt = -1;

            for(let i = input.length + 1; i >= readStart; i--) {
                const sub = input.substring(readStart, i);

                if(isInteger(sub)){
                    tokens.push({ value: sub, token: 'INTEGER' });

                    found = true;
                    foundAt = i;

                    break
                }else if(whitespace.includes(sub)){
                    tokens.push({ value: sub, token: 'WHITESPACE' });

                    found = true;
                    foundAt = i;

                    break
                }else if(symbols.includes(sub)){         
                    tokens.push({ value: sub, token: 'SYMBOL' });

                    found = true;
                    foundAt = i;

                    break
                }else if(keywords.includes(sub)){
                    tokens.push({ value: sub, token: 'KEYWORD' });

                    found = true;
                    foundAt = i;

                    break
                }else if(sub == '\n'){
                    tokens.push({ value: sub, token: 'NEWLINE' });

                    found = true;
                    foundAt = i;

                    break
                }else if(sub == '\r'){
                    tokens.push({ value: sub, token: 'NEWLINE' });

                    found = true;
                    foundAt = i;

                    break
                }else if(sub == 'false' || sub == 'true'){
                    tokens.push({ value: sub, token: 'BOOLEAN' });

                    found = true;
                    foundAt = i;

                    break
                }
            }

            if(found){
                if(lastUnkown != -1){
                    tokens.splice(tokens.length - 1, 0, { value: input.substring(lastUnkown, readStart), token: 'NAME' });

                    lastUnkown = -1;
                }

                readStart = foundAt;
            }else {
                if(lastUnkown == -1) lastUnkown = readStart;

                readStart++;
            }
        }

        if(lastUnkown != -1) {
            tokens.push({ value: input.substring(lastUnkown, readStart), token: 'NAME' });
        }

        return tokens
    }

    //rollup src/firework.js --file compiler/firework.js --format iife

    module.exports = ({ fileType, fileSystem, projectRoot, outputFileSystem, options, compileFiles }) => {
    	let scripts = {};

    	let scriptPaths = {};

    	let outAnimations = {};

    	let entitiesToCompile = [];
    	
    	function noErrors(fileContent)
        {
            return !fileContent?.__error__;
        }

    	function isEntity(filePath){
    		const type = fileType?.getId(filePath);

    		return type == 'entity'
    	}

    	return {
    		async buildStart() {
                try {
    				let newScripts = {};
    				let newScriptPaths = {};

                    const f = await fileSystem.allFiles(projectRoot + '/BP/firework');

    				for(const file of f){
    					if(file.endsWith('.frw')){
    						const filePathArray = file.split('/');

    						const fileName = filePathArray[filePathArray.length - 1].substring(0, filePathArray[filePathArray.length - 1].length - 4);

    						if(newScripts[fileName]){
    							console.warn('WARNING: ' + fileName + ' already exists in scripts!');
    							continue
    						}

    						const fO = await fileSystem.readFile(file);
    						newScripts[fileName] = await fO.text();
    						newScriptPaths[fileName] = file;

    						//console.log('Indexed Script' + fileName + ' to ' + file)
    					}
    				}

    				let entityDepends = {};

    				try{
    					const entities = await fileSystem.allFiles(projectRoot + '/BP/entities');

    					for(const file of entities){
    						const fO = await fileSystem.readFile(file);
    						const content = JSON.parse(await fO.text());
    						
    						if(content['minecraft:entity'] && content['minecraft:entity'].components){
    							const components = Object.keys(content['minecraft:entity'].components);

    							let requiredScripts = [];

    							components.forEach(component => {
    								if(component.startsWith('frw:')){
    									requiredScripts.push(component.substring(4));
    								}
    							});

    							entityDepends[file] = requiredScripts;
    						}

    						//console.log('Indexed Entity' + file)
    					}
    				}catch(e){

    				}

    				//console.log('Generated Entity Depends:')
    				//console.log(entityDepends)

    				const diffScripts = [];

    				const indexedScripts = Object.keys(newScripts);

    				for(const script of indexedScripts){
    					if(!scripts[script]){
    						diffScripts.push(script);

    						continue
    					}

    					if(scripts[script] != newScripts[script]){
    						diffScripts.push(script);

    						continue
    					}

    					if(scriptPaths[script] != newScriptPaths[script]){
    						diffScripts.push(script);

    						continue
    					}
    				}

    				//console.log('Got Diff Scripts:')
    				//console.log(diffScripts)

    				const entityDependsKeys = Object.keys(entityDepends);

    				for(const entity of entityDependsKeys){
    					const entityDependsValue = entityDepends[entity];

    					for(const script of entityDependsValue){
    						if(diffScripts.includes(script)){
    							entitiesToCompile.push(entity);

    							break
    						}
    					}
    				}

    				//console.log('Got Entities to Compile:')
    				//console.log(entitiesToCompile)

    				scripts = newScripts;
    				scriptPaths = newScriptPaths;
                } catch (ex) {}
            },

    		async transform(filePath, fileContent) {			
    			if(noErrors(fileContent) && isEntity(filePath)){
    				//console.log('Transforming ' + filePath)

    				if(fileContent['minecraft:entity'] && fileContent['minecraft:entity'].components){
    					const components = Object.keys(fileContent['minecraft:entity'].components);

    					let requiredScripts = [];

    					components.forEach(component => {
    						if(component.startsWith('frw:')){
    							requiredScripts.push(component.substring(4) + '.frw');
    						}
    					});

    					if(requiredScripts.length > 0){
    						for(const script of requiredScripts){
    							delete fileContent['minecraft:entity'].components['frw:' + script.substring(0, script.length - 4)];
    						}

    						for(const script of requiredScripts){
    							if(scriptPaths[script.substring(0, script.length - 4)]){
    								let scriptContent = scripts[script.substring(0, script.length - 4)];

    								const tokens = Tokenize(scriptContent);

    								const tree = GenerateETree(tokens);

    								if(tree instanceof Error){
    									throw tree.message + ' on line ' + tree.line + ' in ' + script
    								}

    								console.log(filePath + ' : ' + script);

    								const compiled = Compile(tree, {
    									delayChannels: 3  
    								}, fileContent);

    								if(compiled instanceof Error){
    									throw compiled.message + ' on line ' + tree.line + ' in ' + script
    								}

    								let animations = Object.keys(compiled.animations);

    								for(let i = 0; i < animations.length; i++){
    									outAnimations[animations[i]] = compiled.animations[animations[i]];
    								}

    								fileContent = compiled.entity;
    							}else {
    								console.warn('WARNING: ' + script + ' does not exist!');
    							}
    						}

    						return fileContent
    					}
    				}
    			}
    		},

    		async buildEnd() {
    			let outBPPath = 'development_behavior_packs/' + projectRoot.split('/')[1] + ' BP/';

    			if(options.mode != 'development'){
    				outBPPath = projectRoot + '/builds/dist/' + projectRoot.split('/')[1] + ' BP/';
    			}

    			await outputFileSystem.mkdir(outBPPath + 'functions');

    			let mc = 'event entity @e[tag=started3] frw_update\nevent entity @e[tag=started3] frwb_delay\nevent entity @e[tag=started2, tag=!started3] frw_start\ntag @e[tag=started2] add started3\ntag @e[tag=started] add started2\ntag @e add started';

    			await outputFileSystem.writeFile(outBPPath + 'functions/firework_runtime.mcfunction', mc);

    			try{
    				let tick = await outputFileSystem.readFile(outBPPath + 'functions/tick.json');

    				tick = JSON.parse(await tick.text());

    				if(!tick.values.includes('firework_runtime')){
    					tick.values.push('firework_runtime');
    				}

    				await outputFileSystem.writeFile(outBPPath + 'functions/tick.json', JSON.stringify(tick));
    			}catch (ex){
    				//console.log("can't find tick")
    				//console.log(ex)

    				await outputFileSystem.writeFile(outBPPath + 'functions/tick.json', JSON.stringify({
    					values: ['firework_runtime']
    				}));
    			}

    			//console.log('Compiling Extra Entities')
    			//console.log(entitiesToCompile)
    			await compileFiles(entitiesToCompile);

    			await outputFileSystem.mkdir(outBPPath + 'animations');

    			let animations = Object.keys(outAnimations);

    			let animationFile = {
    				format_version: '1.10.0',
    				animations: {

    				}
    			};

    			for(let i = 0; i < animations.length; i++){
    				animationFile.animations[animations[i]] = outAnimations[animations[i]];
    			}

    			await outputFileSystem.writeFile(outBPPath + 'animations/firework_backend.json', JSON.stringify(animationFile, null, 4));

    			outAnimations = {};

    			entitiesToCompile = [];
            },
    	}
    };

})();
