import * as Backend from './Backend.js';

export const functions = {
    rc: {
        params: [
            'STRING'
        ],

        asEntity (params) {
            return {
                animations: {},
                sequence: [
                    {
                        runCommand: {
                            command:[
                                params[0].value
                            ]
                        }
                    }
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
                animations: {},
                sequence: [
                    {
                        runCommand: {
                            command:[
                                'tp ' + params[0].value
                            ]
                        }
                    }
                ]
            }
        },

        supports: 'entity'
    },

    die: {
        params: [],

        asEntity (params) {
            return {
                animations: {},
                sequence: [
                    {
                        runCommand: {
                            command:[
                                'kill @s'
                            ]
                        }
                    }
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
                sequence: [
                    {
                        runCommand: {
                            command:[
                                'say ' + params[0].value
                            ]
                        }
                    }
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
                    return `(math.die_roll_integer(1, 0, 1) == 0)`
                }
            },

            {
                params: [
                    'INTEGER'
                ],
        
                asMolang (params) {
                    console.log(params)
                    console.log(params[0])
                    console.log(params[0].value)
                    return `(math.die_roll_integer(1, 0, ${params[0].value}) == 0)`
                }
            },

            {
                params: [
                    'INTEGER',
                    'INTEGER'
                ],
        
                asMolang (params) {
                    return `(math.die_roll(1, ${params[0].value}, ${params[1].value}) == 0)`
                }
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

        for(const i in functions[name].variations){
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