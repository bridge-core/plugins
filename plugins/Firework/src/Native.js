import * as Backend from './Backend.js';

export const functions = {
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
}

export function doesFunctionExist(name){
    return functions[name] != undefined
}

export function doesFunctionExistWithTemplate(name, template){
    if(!doesFunctionExist(name)){
        return false
    }

    if(doesFunctionHaveVariations(name)){
        let match = false

        for(let i = 0; i < functions[name].variations.length; i++){
            if(doesTemplateMatch(template, functions[name].variations[i].params)){
                match = true
            }
        }

        return match
    }else{
        return doesTemplateMatch(template, functions[name].params)
    }
}

export function doesFunctionHaveVariations(name){
    if(!doesFunctionExist(name)){
        return false
    }

    return functions[name].variations != undefined
}

export function doesFunctionSupportMolang(name){
    if(!doesFunctionExist(name)){
        return false
    }

    return functions[name].supports == 'molang'
}

export function doesFunctionSupportEntity(name){
    if(!doesFunctionExist(name)){
        return false
    }

    return functions[name].supports == 'entity'
}

export function doesTemplateMatch(params, template){
    let pTemplate = []

    for(const i in params){
        pTemplate.push(params[i].token)
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

export function getFunction(name, params){
    if(!doesFunctionExist(name)){
        console.warn('Function does not exist: ' + name)
        return null
    }

    if(!doesFunctionExistWithTemplate(name, params)){
        console.warn('Function does not exist with template: ' + name)
        console.log(params)
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
    }else{
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

export function getIsFunctionDynamic(name, params){
    if(!doesFunctionExist(name)){
        console.warn('Function does not exist: ' + name)
        return null
    }

    if(!doesFunctionExistWithTemplate(name, params)){
        console.warn('Function does not exist with template: ' + name)
        return null
    }

    if(doesFunctionHaveVariations(name)){
        for(const i in functions[name].variations){
            if(doesTemplateMatch(params, functions[name].variations[i].params)){
                return functions[name].variations[i].dynamic
            }
        }
    }else{
        if(doesTemplateMatch(params, functions[name].params)){
            return functions[name].dynamic
        }
    }
}

export const operations = {
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
}

export const dynamicDataTypes = [
    'MOLANG',
    'FLAG'
]

export function isOperationDynamic(operation){
    const params = operation.value.slice(1)

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

export function canDoOperation(operation){
    const params = operation.value.slice(1)

    const operationName = operation.value[0].value

    if(operations[operationName].params.length != params.length){
        return false
    }

    let pParams = []

    for(const i in params){
        pParams.push(params[i].token)
    }

    for(const i in pParams){
        if(pParams[i] != operations[operationName].params[i] && !operations[operationName].params[i] == 'ANY'){
            return false
        }
    }

    return true
}

export function optimizeOperation(operation){
    const params = operation.value.slice(1)

    const operationName = operation.value[0].value

    return operations[operationName].optimize(params)
}

export function tokenToUseable(token){
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

let dynamicFlags = {}

export function setDynamicFlags(flags){
    dynamicFlags = flags
}

export function tokenToMolang(token){
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
        }else{
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

export function variableToMolang(token){
    if(token.token == 'EXPRESSION'){
        const operation = token.value[0].value
        const params = token.value.slice(1)

        token = {
            value: '(' + operations[operation].toMolang(params) + ')',
            token: 'MOLANG',
            line: token.line
        }        
    }else if(token.token == 'CALL'){
        const cName = token.value[0].value
        const cParams = token.value.slice(1)

        token = {
            value: '(' + getFunction(cName, cParams) + ')',
            token: 'MOLANG',
            line: token.line
        }
    }else{
        token = {
            value: '(' + tokenToMolang(token).value + ')',
            token: 'MOLANG',
            line: token.line
        }
    }
    
    return token
}