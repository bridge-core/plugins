import * as Backend from './Backend.js'

function isInteger(str){
    if(typeof str != 'string') return false

    if(str.length == 0) return false

    if(str.includes('.')) return false

    if(str.includes(' ')) return false

    if(str.includes('\n')) return false

    if(str.includes('\r')) return false

    return Number.isInteger(Number(str))
}

function isFloat(){

}

const whitespace = [
    ' ',
    '\t',
]

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
    "'"
]

const keywords = [
    'if',
    'fif',
    'dyn',
    'func',
    'delay',
    'else'
]

export function Tokenize(input) {
    let tokens = []

    let readStart = 0

    let lastUnkown = -1

    while(readStart < input.length) {
        let found = false
        let foundAt = -1

        for(let i = input.length + 1; i >= readStart; i--) {
            const sub = input.substring(readStart, i)

            if(isInteger(sub)){
                tokens.push({ value: sub, token: 'INTEGER' })

                found = true
                foundAt = i

                break
            }else if(whitespace.includes(sub)){
                tokens.push({ value: sub, token: 'WHITESPACE' })

                found = true
                foundAt = i

                break
            }else if(symbols.includes(sub)){         
                tokens.push({ value: sub, token: 'SYMBOL' })

                found = true
                foundAt = i

                break
            }else if(keywords.includes(sub)){
                tokens.push({ value: sub, token: 'KEYWORD' })

                found = true
                foundAt = i

                break
            }else if(sub == '\n'){
                tokens.push({ value: sub, token: 'NEWLINE' })

                found = true
                foundAt = i

                break
            }else if(sub == '\r'){
                tokens.push({ value: sub, token: 'NEWLINE' })

                found = true
                foundAt = i

                break
            }else if(sub == 'false' || sub == 'true'){
                tokens.push({ value: sub, token: 'BOOLEAN' })

                found = true
                foundAt = i

                break
            }
        }

        if(found){
            if(lastUnkown != -1){
                tokens.splice(tokens.length - 1, 0, { value: input.substring(lastUnkown, readStart), token: 'NAME' })

                lastUnkown = -1
            }

            readStart = foundAt
        }else{
            if(lastUnkown == -1) lastUnkown = readStart

            readStart++
        }
    }

    if(lastUnkown != -1) {
        tokens.push({ value: input.substring(lastUnkown, readStart), token: 'NAME' })
    }

    return tokens
}