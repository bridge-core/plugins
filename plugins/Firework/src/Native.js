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
                    return `(math.random(0, 1) >= 0.23)`
                },

                dynamic: true,
            },

            {
                params: [
                    'INTEGER'
                ],
        
                asMolang (params) {
                    let deep = variableToMolang(params[0])

                    if(deep instanceof Backend.Error) return deep

                    return `(math.random(0, 1) >= ${1 / deep.value * 0.23})`
                },

                dynamic: true
            }
        ],

        supports: 'molang',
        
        returns: 'BOOLEAN'
    },
    
    /*par: {
        params: [
            'BOOLEAN'
        ],

        asEntity (params) {
            return {
                commands: params[0].value == 'true' ? [
                    `kill @s`
                ] : []
            }
        },

        supports: 'entity'
    }*/
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
        if(params[i].token == 'CALL'){
            pTemplate.push(getReturnType(params[i].value[0].value, params[i].value.slice(1)))
        }else{
            pTemplate.push(complexTypeToSimpleType(params[i].token))
        }
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

export function getReturnType(name, params){
    if(!doesFunctionExist(name)){
        console.warn('Function does not exist: ' + name)
        return null
    }

    if(!doesFunctionExistWithTemplate(name, params)){
        console.warn('Function does not exist with template: ' + name)
        console.log(params)
        return null
    }

    return functions[name].returns
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} + ${deep2.value}`
        },

        returns: 'INTEGER'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} - ${deep2.value}`
        },

        returns: 'INTEGER'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} * ${deep2.value}`
        },

        returns: 'INTEGER'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} / ${deep2.value}`
        },

        returns: 'FLOAT'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} && ${deep2.value}`
        },

        returns: 'BOOLEAN'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} || ${deep2.value}`
        },

        returns: 'BOOLEAN'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} == ${deep2.value}`
        },

        returns: 'BOOLEAN'
    },

    '!=': {
        params: [
            'ANY',
            'ANY'
        ],

        optimize(params){
            if(params[0].token != params[1].token){
                return {
                    value: 'true',
                    token: 'BOOLEAN',
                    line: params[0].line
                }
            }

            return {
                value: (tokenToUseable(params[0]) != tokenToUseable(params[1])).toString(),
                token: 'BOOLEAN',
                line: params[0].line
            }
        },

        toMolang(params){
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} != ${deep2.value}`
        },

        returns: 'BOOLEAN'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} > ${deep2.value}`
        },

        returns: 'BOOLEAN'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} < ${deep2.value}`
        },

        returns: 'BOOLEAN'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} >= ${deep2.value}`
        },

        returns: 'BOOLEAN'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            let deep2 = variableToMolang(params[1])

            if(deep2 instanceof Backend.Error) return deep2

            return `${deep.value} <= ${deep2.value}`
        },

        returns: 'BOOLEAN'
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
            let deep = variableToMolang(params[0])

            if(deep instanceof Backend.Error) return deep

            return `!${deep.value}`
        },

        returns: 'BOOLEAN'
    },
}

export const dynamicDataTypes = [
    'MOLANG',
    'FLAG',
    'VAR'
]

export function isTypeStatic(token){
    return !dynamicDataTypes.includes(token) && token != 'EXPRESSION'
}

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
        if(params[i].token == 'CALL'){
            pParams.push(getReturnType(params[i].value[0].value, params[i].value.slice(1)))
        }else{
            pParams.push(params[i].token)
        }
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

export function valueToToken(value){
    if(typeof value == 'string'){
        return {
            value: value,
            token: 'STRING',
            line: -1
        }
    }else if(typeof value == 'number'){
        return {
            value: value,
            token: 'INTEGER',
            line: -1
        }
    }else if(typeof value == 'boolean'){
        return {
            value: value,
            token: 'BOOLEAN',
            line: -1
        }
    }
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
    }else if(token.token == 'VAR'){
        return {
            value: `q.actor_property('frw:${token.value}')`,
            token: 'MOLANG',
            line: token.line
        }
    }

    return new Backend.Error(`Can't convert token ${token.token} to molang!`, token.line)
}

export function variableToMolang(token){
    if(token.token == 'EXPRESSION'){
        const operation = token.value[0].value
        const params = token.value.slice(1)

        let deep = operations[operation].toMolang(params)

        if(deep instanceof Backend.Error) return deep

        token = {
            value: '(' + deep + ')',
            token: 'MOLANG',
            line: token.line
        }        
    }else if(token.token == 'CALL'){
        const cName = token.value[0].value
        const cParams = token.value.slice(1)

        let deep = getFunction(cName, cParams)

        if(deep instanceof Backend.Error) return deep

        token = {
            value: '(' + deep + ')',
            token: 'MOLANG',
            line: token.line
        }
    }else{
        let deep = tokenToMolang(token)

        if(deep instanceof Backend.Error){
            return deep
        }

        token = {
            value: '(' + deep.value + ')',
            token: 'MOLANG',
            line: token.line
        }
    }
    
    return token
}

export function getOperationReturnType(operation){
    return operations[operation].returns
}

export function isComplexType(type){
    return dynamicDataTypes.includes(type)
}

export function complexTypeToSimpleType(type, token){
    switch(type){
        case 'MOLANG':
            return 'BOOLEAN'
        case 'FLAG':
            return 'BOOLEAN'
        case 'EXPRESSION':
            return getOperationReturnType(token.value[0].value)
        default:
            return type
    }
}