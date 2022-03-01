import * as Backend from './Backend.js'

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function splitLines(tokens){
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        const nextToken = tokens[i + 1]

        if(token.token == 'NEWLINE' && nextToken && nextToken.token == 'NEWLINE'){
            tokens.splice(i, 1)
            tokens[i].value = '\n'

            i--
        }
    }

    let lines = []

    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'NEWLINE'){
            lines.push(tokens.slice(0, i))

            tokens.splice(0, i + 1)

            i = 0
        }
    }

    lines.push(tokens.slice(0, tokens.length))

    return lines
}

function buildCodeBlocks(tokens){
    let openPaths = []

    for(let x = 0; x < tokens.length; x++){
        for(let y = 0; y < tokens[x].length; y++){
            if(tokens[x][y].value == '{' && tokens[x][y].token == 'SYMBOL'){
                openPaths.push({ x: x, y: y })
            }

            if(tokens[x][y].value == '}' && tokens[x][y].token == 'SYMBOL'){
                let openPath = openPaths.pop()

                if(!openPath){
                    return new Backend.Error('Unexpected }!')
                }

                let inBlockLines = []

                for(let i = openPath.x; i <= x; i++){
                    if(i == openPath.x){
                        inBlockLines.push(tokens[i].slice(openPath.y + 1, tokens[i].length))
                    }else if(i == x){
                        inBlockLines.push(tokens[i].slice(0, y))
                    }else{
                        inBlockLines.push(tokens[i])
                    }
                }

                for(let i = 0; i < inBlockLines.length; i++){
                    if(inBlockLines[i].length == 0){
                        inBlockLines.splice(i, 1)
                        i--
                    }
                }

                tokens[openPath.x].splice(openPath.y, tokens[openPath.x].length, { value: inBlockLines, token: 'BLOCK' })

                tokens[x].splice(0, y + 1)

                if(tokens[x].length == 0){
                    tokens.splice(x, 1)
                }

                if(x - openPath.x > 1){
                    tokens.splice(openPath.x + 1, x - openPath.x - 1)
                }

                x = openPath.x
            }
        }
    }

    if(openPaths.length > 0){
      return new Backend.Error('Unclosed \'{\'!')
    }

    return tokens
}

function buildCompoundTypes(tokens){
    for(let l = 0; l < tokens.length; l++){
        let inString = false
        let inStringIndex = -1

        //Go Deeper Into Blocks
        for(let i = 0; i < tokens[l].length; i++){
            if(tokens[l][i].token == 'BLOCK'){
                const deep = buildCompoundTypes(tokens[l][i].value)

                if(deep instanceof Backend.Error){
                  return deep
                }

                tokens[l][i].value = deep
            }
        }

        let removed = false

        //Remove Whitespace and Create Strings
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'SYMBOL' && (token.value == '"' || token.value == "'")){
                inString = !inString

                if(inString){
                    inStringIndex = i
                }else{            
                    let tokensInString = tokens[l].slice(inStringIndex + 1, i)

                    let resultString = ''

                    for(let j = 0; j < tokensInString.length; j++){
                        resultString += tokensInString[j].value
                    }

                    tokens[l].splice(inStringIndex, i - inStringIndex + 1, { value: resultString, token: 'STRING' })

                    i -= i - inStringIndex
                }
            }
            
            if(token.token == 'WHITESPACE' && !inString){
                tokens[l].splice(i, 1)

                i--
            }

            if(tokens[l].length == 0){
                tokens.splice(l, 1)

                l--

                removed = true

                break
            }
        }

        if(removed){
            continue
        }

        if(inString){
          return new Backend.Error('Unclosed string!')
        }

        //Combine Numbers
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'INTEGER'){
                let nextToken = tokens[l][i + 1]

                if(nextToken && nextToken.token == 'INTEGER'){
                    tokens[l].splice(i, 2, { value: token.value + nextToken.value, token: 'INTEGER' })

                    i--
                }
            }
        }

        //Build Flags
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const prevToken = tokens[l][i - 1]

            if(token.token == 'NAME' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '$'){
                tokens[l].splice(i - 1, 2, { value: token.value, token: 'FLAG' })

                i--
            }
        }

        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'SYMBOL' && token.value == '$'){
                return new Backend.Error('Unexpected symbol \'$\'!')
            }
        }

        //Build Molang
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const prevToken = tokens[l][i - 1]

            if(token.token == 'STRING' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '?'){
                tokens[l].splice(i - 1, 2, { value: token.value, token: 'MOLANG' })

                i--
            }
        }

        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'SYMBOL' && token.value == '?'){
                return new Backend.Error('Unexpected symbol \'?\'!')
            }
        }

        //Build Arrows
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const prevToken = tokens[l][i - 1]

            if(token.token == 'SYMBOL' && token.value == '>' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '='){
                tokens[l].splice(i - 1, 2, { value: '=>', token: 'ARROW' })

                i--
            }
        }

        //Build Empty Function Calls
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const nextToken = tokens[l][i + 1]
            const nextNextToken = tokens[l][i + 2]

            if(token.token == 'NAME' && nextToken && nextToken.value == '(' && nextNextToken && nextNextToken.value == ')'){
                tokens[l].splice(i, 3, { value: [token], token: 'CALL' })
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
                const deep = buildExpressions(tokens[l][i].value)

                if(deep instanceof Backend.Error){
                    return deep
                }

                tokens[l][i].value = deep
            }
        }

        //Build Expression
        for(let i = 0; i < tokens[l].length; i++){
            const deep = buildExpressionsSingle(tokens[l])

            if(deep instanceof Backend.Error){
                return deep
            }

            tokens[l] = deep
        }
    }

    return tokens
}

function buildExpressionsSingle(tokens){
    //Create Parantheses Groups
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && token.value == '('){
            let prevToken = tokens[i - 1]

            if(!(prevToken && (prevToken.token == 'NAME' || prevToken.token == 'KEYWORD'))){
                let found = 0;
                let endingIndex = -1

                for(let j = i + 1; j < tokens.length; j++){
                    const nextToken = tokens[j]

                    if(nextToken.token == 'SYMBOL' && nextToken.value == '('){            
                        found++
                    }else if(nextToken.token == 'SYMBOL' && nextToken.value == ')'){
                        if(found == 0){
                            endingIndex = j
                            break
                        }
                        
                        found--
                    }
                }

                if(found > 0 || endingIndex == -1){
                    return new Backend.Error('Unclosed parantheses!')
                }

                let insideTokens = tokens.slice(i + 1, endingIndex)

                const paramOut = buildParamsSingle(insideTokens)

                if(paramOut instanceof Backend.Error){
                    return paramOut
                }

                const deep = buildExpressionsSingle(paramOut)

                if(deep instanceof Backend.Error){
                    return deep
                }

                if(deep.length != 1){
                    return new Backend.Error('Unresolved symbols 01:\n' + JSON.stringify(deep))
                }

                tokens.splice(i, endingIndex - i + 1, deep[0])

                i--
            }
        }
    }

    //Create Expressions * and /
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && (token.value == '*' || token.value == '/')){
            let nextToken = tokens[i + 1]
            let prevToken = tokens[i - 1]

            if(prevToken && nextToken){
                if(!(nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                    return new Backend.Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`)
                }

                tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION' })

                i--
            }
        }
    }

    //Create Expressions + and -
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && (token.value == '+' || token.value == '-')){
            let nextToken = tokens[i + 1]
            let prevToken = tokens[i - 1]

            if(prevToken && nextToken){
                if(!(nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                    return new Backend.Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`)
                }
                
                tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION' })

                i--
            }
        }
    }

    //Create Expressions !
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && token.value == '!'){
            let nextToken = tokens[i + 1]

            if(nextToken){
                if(!(nextToken.token == 'EXPRESSION' || nextToken.token == 'FLAG' || nextToken.token == 'BOOLEAN' || nextToken.token == 'MOLANG')){
                    return new Backend.Error(`Can not do operation '${token.value}' with '${nextToken.token}'!`)
                }

                tokens.splice(i, 2, { value: [token, nextToken], token: 'EXPRESSION' })
            }
        }
    }

    //Create Expressions == > < >= <=
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]
        const nextToken = tokens[i + 1]

        if(token.token == 'SYMBOL' && (token.value == '=' || token.value == '>' || token.value == '<')){
            let prevToken = tokens[i - 1]

            if(prevToken && nextToken){
                if(nextToken.token == 'SYMBOL' && nextToken.value == '='){
                    let nextNextToken = tokens[i + 2]
                    
                    if(token.value == '>' || token.value == '<'){
                        if(!(nextNextToken.token == 'INTEGER' || nextNextToken.token == 'EXPRESSION') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                            return new Backend.Error(`Can not do operation '${token.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`)
                        }
                        
                        const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' }
                        
                        tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION' })

                        i--
                    }else{
                        if(!(nextNextToken.token == 'INTEGER' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'FLAG' || nextNextToken.token == 'MOLANG') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'BOOLEAN' || prevToken.token == 'FLAG' || prevToken.token == 'MOLANG')){
                            return new Backend.Error(`Can not do operation '${token.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`)
                        }

                        const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' }
                            
                        tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION' })

                        i--
                    }
                }else if(token.value == '>' || token.value == '<'){
                    if(!(nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION')){
                        return new Backend.Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`)
                    }

                    tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION' })

                    i--
                }
            }
        }
    }

    //Create Expressions || and &&
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]
        const nextToken = tokens[i + 1]

        if(token.token == 'SYMBOL' && nextToken && nextToken.token == 'SYMBOL' && ((token.value == '|' && nextToken.value == '|') || (token.value == '&' && nextToken.value == '&'))){    
            let nextNextToken = tokens[i + 2]
            let prevToken = tokens[i - 1]

            if(prevToken && nextNextToken){
                if(!(nextNextToken.token == 'FLAG' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'MOLANG') || !(prevToken.token == 'FLAG' || prevToken.token == 'EXPRESSION' || prevToken.token == 'BOOLEAN' || prevToken.token == 'MOLANG')){
                    return new Backend.Error(`Can not do operation '${token.value + nextToken.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`)
                }

                const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' }
                
                tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION'})

                i--
            }
        }
    }

    return tokens
}

function buildParamsSingle(tokens){
    //Go Into Complex Function Calls
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.token == 'SYMBOL' && token.value == '('){
            const prevToken = tokens[i - 1]

            if(prevToken && prevToken.token == 'NAME'){
                for(let j = i + 1; j < tokens.length; j++){
                    const otherToken = tokens[j]

                    if(otherToken.token == 'SYMBOL' && otherToken.value == '('){
                        const otherPrevToken = tokens[j - 1]

                        if(otherPrevToken && otherPrevToken.token == 'NAME'){
                            let opensFound = 0

                            let endIndex = -1

                            for(let u = j + 1; u < tokens.length; u++){
                                const otherOtherToken = tokens[u]
            
                                if(otherOtherToken.token == 'SYMBOL' && otherOtherToken.value == '('){
                                    opensFound++
                                }

                                if(otherOtherToken.token == 'SYMBOL' && otherOtherToken.value == ')'){
                                    if(opensFound == 0){
                                        endIndex = u

                                        break
                                    }else{
                                        opensFound--
                                    }
                                }
                            }

                            if(opensFound != 0 || endIndex == -1){
                                return new Backend.Error('Unclosed parantheses!')
                            }

                            let parsed = buildParamsSingle(tokens.slice(j - 1, endIndex + 1))

                            if(parsed instanceof Backend.Error){
                                return parsed
                            }

                            if(parsed.length != 1){
                                return new Backend.Error('Unresolved symbols 02:\n' + JSON.stringify(parsed))
                            }

                            tokens.splice(j - 1, endIndex - j + 2, parsed[0])
                        }
                    }
                }

                let opensFound = 0

                let endIndex = -1

                for(let u = i + 1; u < tokens.length; u++){
                    const otherOtherToken = tokens[u]

                    if(otherOtherToken.token == 'SYMBOL' && otherOtherToken.value == '('){
                        opensFound++
                    }

                    if(otherOtherToken.token == 'SYMBOL' && otherOtherToken.value == ')'){
                        if(opensFound == 0){
                            endIndex = u

                            break
                        }else{
                            opensFound--
                        }
                    }
                }

                if(opensFound != 0 || endIndex == -1){
                    return new Backend.Error('Unclosed parantheses!')
                }

                //Build Expressions Between Commas
                let groups = []
                let lastGroupPos = i

                for(let k = i; k < endIndex; k++){
                    const goalToken = tokens[k]

                    if(goalToken.token == 'SYMBOL' && goalToken.value == ','){
                        let group = buildExpressionsSingle(tokens.slice(lastGroupPos + 1, k))

                        if(group instanceof Backend.Error){
                            return parsed
                        }

                        if(group.length != 1){
                            return new Backend.Error('Unresolved symbols 03:\n' + JSON.stringify(group))
                        }

                        groups.push(group[0])

                        lastGroupPos = k
                    }
                }

                let group = buildExpressionsSingle(tokens.slice(lastGroupPos + 1, endIndex))

                if(group instanceof Backend.Error){
                    return parsed
                }

                if(group.length != 1){
                    return new Backend.Error('Unresolved symbols 04:\n' + JSON.stringify(group))
                }

                groups.push(group[0])

                groups.unshift(prevToken)

                tokens.splice(i - 1, endIndex - i + 2, { value: groups, token: 'CALL' })
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
                const deep = buildParams(tokens[l][i].value)

                if(deep instanceof Backend.Error){
                    return deep
                }

                tokens[l][i].value = deep
            }
        }

        const deepOut = buildParamsSingle(tokens[l])

        if(deepOut instanceof Backend.Error){
            return deepOut
        }

        tokens[l] = deepOut
    }

    return tokens
}

function buildAsignments(tokens){
    for(let l = 0; l < tokens.length; l++){
        //Build Asignments
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const nextToken = tokens[l][i + 1]
            const nextNextToken = tokens[l][i + 2]
            const nextNextNextToken = tokens[l][i + 3]

            if(token.token == 'KEYWORD' && token.value == 'dyn' && nextToken && nextToken.token == 'NAME' && nextNextToken && nextNextToken.token == 'SYMBOL' && nextNextToken.value == '=' && nextNextNextToken){
                if(!(nextNextNextToken.token == 'MOLANG' || nextNextNextToken.token == 'EXPRESSION')){
                    return new Backend.Error(`Dynamic can't be assigned to ${nextNextNextToken.token}!`)
                }

                tokens[l].splice(i, 4, { value: [token, nextToken, nextNextNextToken], token: 'ASSIGN' })
            }
        }

        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const nextToken = tokens[l][i + 1]
            const nextNextToken = tokens[l][i + 2]
            const nextNextNextToken = tokens[l][i + 3]

            if(token.token == 'KEYWORD' && token.value == 'const' && nextToken && nextToken.token == 'NAME' && nextNextToken && nextNextToken.token == 'SYMBOL' && nextNextToken.value == '=' && nextNextNextToken){
                if(!(nextNextNextToken.token == 'INTEGER' || nextNextNextToken.token == 'BOOLEAN' || nextNextNextToken.token == 'STRING' || nextNextNextToken.token == 'EXPRESSION')){
                    return new Backend.Error(`Constant can't be assigned to ${nextNextNextToken.token}!`)
                }

                tokens[l].splice(i, 4, { value: [token, nextToken, nextNextNextToken], token: 'ASSIGN' })
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
                const deep = buildIfAndDelay(tokens[l][i].value)

                if(deep instanceof Backend.Error){
                    return deep
                }

                tokens[l][i].value = deep
            }
        }

        //Build Ifs And Delays
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const nextToken = tokens[l][i + 1]
            const nextNextToken = tokens[l][i + 2]
            const nextNextNextToken = tokens[l][i + 3]
            const nextNextNextNextToken = tokens[l][i + 4]
            const nextNextNextNextNextToken = tokens[l][i + 5]

            if(token.token == 'KEYWORD' && token.value == 'if' && nextToken && nextToken.token == 'SYMBOL' && nextToken.value == '(' && nextNextToken && nextNextNextToken && nextNextNextToken.token == 'SYMBOL' && nextNextNextToken.value == ')' && nextNextNextNextToken && nextNextNextNextToken.token == 'ARROW' && nextNextNextNextNextToken && nextNextNextNextNextToken.token == 'BLOCK'){
                if(!(nextNextToken.token == 'FLAG' || nextNextToken.token == 'NAME' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'MOLANG' || nextNextToken.token == 'CALL')){
                    return new Backend.Error(`If condition can't be ${nextNextToken.token}!`)
                }
                
                for(let j = 0; j < nextNextNextNextNextToken.value.length; j++){
                    nextNextNextNextNextToken.value[j] = nextNextNextNextNextToken.value[j][0]
                }
                
                tokens[l].splice(i, 6, { value: [nextNextToken, nextNextNextNextNextToken], token: 'IF' })
            }
        }

        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const nextToken = tokens[l][i + 1]
            const nextNextToken = tokens[l][i + 2]
            const nextNextNextToken = tokens[l][i + 3]
            const nextNextNextNextToken = tokens[l][i + 4]
            const nextNextNextNextNextToken = tokens[l][i + 5]

            if(token.token == 'KEYWORD' && token.value == 'delay' && nextToken && nextToken.token == 'SYMBOL' && nextToken.value == '(' && nextNextToken && nextNextNextToken && nextNextNextToken.token == 'SYMBOL' && nextNextNextToken.value == ')' && nextNextNextNextToken && nextNextNextNextToken.token == 'ARROW' && nextNextNextNextNextToken && nextNextNextNextNextToken.token == 'BLOCK'){
                if(nextNextToken.token != 'INTEGER'){
                    return new Backend.Error(`Delay must be an integer!`)
                }
                
                for(let j = 0; j < nextNextNextNextNextToken.value.length; j++){
                    nextNextNextNextNextToken.value[j] = nextNextNextNextNextToken.value[j][0]
                }
                
                tokens[l].splice(i, 6, { value: [nextNextToken, nextNextNextNextNextToken], token: 'DELAY' })
            }
        }
    }

    return tokens
}

function buildFunctions(tokens){
    for(let l = 0; l < tokens.length; l++){
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const nextToken = tokens[l][i + 1]
            const nextNextToken = tokens[l][i + 2]
            const nextNextNextToken = tokens[l][i + 3]

            if(token.token == 'KEYWORD' && token.value == 'func' && nextToken && nextToken.token == 'NAME' && nextNextToken && nextNextToken.token == 'ARROW' && nextNextNextToken && nextNextNextToken.token == 'BLOCK'){
                for(let j = 0; j <  nextNextNextToken.value.length; j++){
                    nextNextNextToken.value[j] = nextNextNextToken.value[j][0]
                }
                
                tokens[l].splice(i, 6, { value: [nextToken, nextNextNextToken], token: 'DEFINITION' })
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
                let deep = buildFlagAssignments(tokens[l][i].value)

                if(deep instanceof Backend.Error){
                    return deep
                }

                tokens[l][i].value = deep
            }
        }

        //Build Flag Asignments
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const nextToken = tokens[l][i + 1]
            const nextNextToken = tokens[l][i + 2]

            if(token.token == 'FLAG' && nextToken && nextToken.token == 'SYMBOL' && nextToken.value == '=' && nextNextToken){
                if(nextNextToken.token != 'BOOLEAN'){
                    return new Backend.Error('Can\'t assign flag to ' + nextNextToken.token + '!')
                }
                
                tokens[l].splice(i, 3, { value: [token, nextNextToken], token: 'ASSIGN' })
            }
        }
    }

    return tokens
}

export function GenerateETree(tokens){
    tokens = splitLines(tokens)
    
    tokens = buildCodeBlocks(tokens)

    if(tokens instanceof Backend.Error){
      return tokens
    }

    tokens = buildCompoundTypes(tokens)

    if(tokens instanceof Backend.Error){
      return tokens
    }

    let allEmpty = true

    for(let i = 0; i < tokens.length; i++){
        if(tokens[i].length != 0){
            allEmpty = false
        }
    }

    if(allEmpty){
        return new Backend.Error('File was empty!')
    }

    tokens = buildParams(tokens)

    if(tokens instanceof Backend.Error){
        return tokens
    }

    tokens = buildExpressions(tokens)

    if(tokens instanceof Backend.Error){
        return tokens
    }

    tokens = buildFlagAssignments(tokens)

    if(tokens instanceof Backend.Error){
        return tokens
    }

    tokens = buildAsignments(tokens)

    if(tokens instanceof Backend.Error){
        return tokens
    }

    tokens = buildIfAndDelay(tokens)

    if(tokens instanceof Backend.Error){
        return tokens
    }

    tokens = buildFunctions(tokens)

    if(tokens instanceof Backend.Error){
      return tokens
    }

    for(let l = 0; l < tokens.length; l++){
        if(tokens[l].length != 1){
            tokens[l].splice(l, 1)
            l--
        }else{
            tokens[l] = tokens[l][0]
        }
    }

    return tokens
}