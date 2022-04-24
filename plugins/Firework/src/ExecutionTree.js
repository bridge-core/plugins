import * as Backend from './Backend.js'
import * as Native from './Native.js'

function splitLines(tokens){
    let lineCount = 1

    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        tokens[i].line = lineCount

        if(token.token == 'NEWLINE' && token.value == '\n'){
            lineCount++
        }
    }

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

function buildStrings(tokens){
    for(let l = 0; l < tokens.length; l++){
        let inString = false
        let inStringIndex = -1

        let stringChar = ''

        let removed = false

        let lastStringLine

        //Remove Whitespace and Create Strings
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'SYMBOL' && (token.value == '"' || token.value == "'") && (stringChar == '' || stringChar == token.value)){
                inString = !inString

                if(inString){
                    inStringIndex = i
                    lastStringLine = token.line
                    stringChar = token.value
                }else{            
                    let tokensInString = tokens[l].slice(inStringIndex + 1, i)

                    let resultString = ''

                    for(let j = 0; j < tokensInString.length; j++){
                        resultString += tokensInString[j].value
                    }

                    tokens[l].splice(inStringIndex, i - inStringIndex + 1, { value: resultString, token: 'STRING', line: token.line })

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
          return new Backend.Error('Unclosed string!', lastStringLine)
        }        
    }

    return tokens
}

function buildCodeBlocks(tokens){
    let openPaths = []

    let firstBracketLine = -1

    for(let x = 0; x < tokens.length; x++){
        for(let y = 0; y < tokens[x].length; y++){
            if(tokens[x][y].value == '{' && tokens[x][y].token == 'SYMBOL'){
                if(firstBracketLine == -1){
                    firstBracketLine = tokens[x][y].line
                }

                openPaths.push({ x: x, y: y })
            }

            if(tokens[x][y].value == '}' && tokens[x][y].token == 'SYMBOL'){
                let openPath = openPaths.pop()

                if(!openPath){
                    return new Backend.Error('Unexpected }!', tokens[x][y].line)
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

                tokens[openPath.x].splice(openPath.y, tokens[openPath.x].length, { value: inBlockLines, token: 'BLOCK', line: tokens[x][y].line })

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
      return new Backend.Error('Unclosed \'{\'!', firstBracketLine)
    }

    return tokens
}

function buildCompoundTypes(tokens){
    for(let l = 0; l < tokens.length; l++){
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

        //Combine Numbers
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'INTEGER'){
                let nextToken = tokens[l][i + 1]

                if(nextToken && nextToken.token == 'INTEGER'){
                    tokens[l].splice(i, 2, { value: token.value + nextToken.value, token: 'INTEGER', line: token.line })

                    i--
                }
            }
        }

        //Build Flags
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const prevToken = tokens[l][i - 1]

            if(token.token == 'NAME' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '$'){
                tokens[l].splice(i - 1, 2, { value: token.value, token: 'FLAG', line: token.line })

                i--
            }
        }

        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'SYMBOL' && token.value == '$'){
                return new Backend.Error('Unexpected symbol \'$\'!', token.line)
            }
        }

        //Build Vars
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const prevToken = tokens[l][i - 1]

            if(token.token == 'NAME' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '#'){
                tokens[l].splice(i - 1, 2, { value: token.value, token: 'VAR', line: token.line })

                i--
            }
        }

        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'SYMBOL' && token.value == '#'){
                return new Backend.Error('Unexpected symbol \'#\'!', token.line)
            }
        }

        //Build Molang
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const prevToken = tokens[l][i - 1]

            if(token.token == 'STRING' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '?'){
                tokens[l].splice(i - 1, 2, { value: token.value, token: 'MOLANG', line: token.line })

                i--
            }
        }

        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]

            if(token.token == 'SYMBOL' && token.value == '?'){
                return new Backend.Error('Unexpected symbol \'?\'!', token.line)
            }
        }

        //Build Arrows
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const prevToken = tokens[l][i - 1]

            if(token.token == 'SYMBOL' && token.value == '>' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '='){
                tokens[l].splice(i - 1, 2, { value: '=>', token: 'ARROW', line: token.line })

                i--
            }
        }

        //Build Empty Function Calls
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const nextToken = tokens[l][i + 1]
            const nextNextToken = tokens[l][i + 2]

            if(token.token == 'NAME' && nextToken && nextToken.value == '(' && nextNextToken && nextNextToken.value == ')'){
                tokens[l].splice(i, 3, { value: [token], token: 'CALL', line: token.line })
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
                    return new Backend.Error('Unclosed parantheses!', token.line)
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
                    return new Backend.Error('Unexpected symbol (01) ' + deep[0].value, deep[0].line)
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
                if(!(nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION' || nextToken.token == 'CALL' || nextToken.token == 'VAR') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'CALL' || prevToken.token == 'VAR')){
                    return new Backend.Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`, token.line)
                }

                tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION', line: token.line })

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
                if(!(nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION' || nextToken.token == 'CALL' || nextToken.token == 'VAR') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'CALL' || prevToken.token == 'VAR')){
                    return new Backend.Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`, token.line)
                }
                
                tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION', line: token.line })

                i--
            }
        }
    }

    //Create Expressions !
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]
        const nextToken = tokens[i + 1]

        if(token.token == 'SYMBOL' && token.value == '!' && (!nextToken || !(nextToken.token == 'SYMBOL' && nextToken.value == '='))){
            let nextToken = tokens[i + 1]

            if(nextToken){
                if(!(nextToken.token == 'EXPRESSION' || nextToken.token == 'FLAG' || nextToken.token == 'BOOLEAN' || nextToken.token == 'MOLANG' || nextToken.token == 'CALL')){
                    return new Backend.Error(`Can not do operation '${token.value}' with '${nextToken.token}'!`, token.line)
                }

                tokens.splice(i, 2, { value: [token, nextToken], token: 'EXPRESSION', line: token.line })
            }
        }
    }

    //Create Expressions == != > < >= <=
    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]
        const nextToken = tokens[i + 1]

        if(token.token == 'SYMBOL' && (token.value == '=' || token.value == '!' || token.value == '>' || token.value == '<')){
            let prevToken = tokens[i - 1]

            if(prevToken && nextToken){
                if(nextToken.token == 'SYMBOL' && nextToken.value == '='){
                    let nextNextToken = tokens[i + 2]

                    if(token.value == '>' || token.value == '<'){
                        if(!(nextNextToken.token == 'INTEGER' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'NAME' || nextNextToken.token == 'CALL' || nextNextToken.token == 'VAR') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'NAME' || prevToken.token == 'CALL' || prevToken.token == 'VAR')){
                            return new Backend.Error(`Can not do operation '${token.value + nextToken.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`, token.line)
                        }
                        
                        const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' }
                        
                        tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION', line: token.line })

                        i--
                    }else{
                        if(!(nextNextToken.token == 'INTEGER' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'FLAG' || nextNextToken.token == 'MOLANG' || nextNextToken.token == 'NAME'  || nextNextToken.token == 'CALL' || nextNextToken.token == 'VAR') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'BOOLEAN' || prevToken.token == 'FLAG' || prevToken.token == 'MOLANG' || prevToken.token == 'NAME' || prevToken.token == 'CALL' || prevToken.token == 'VAR')){
                            return new Backend.Error(`Can not do operation '${token.value + nextToken.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`, token.line)
                        }

                        const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' }

                        tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION', line: token.line })

                        i--
                    }
                }else if(token.value == '>' || token.value == '<'){
                    if(!(nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION' || nextNextToken.token == 'NAME' || nextNextToken.token == 'CALL' || nextNextToken.token == 'VAR') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'NAME' || prevToken.token == 'CALL' || prevToken.token == 'VAR')){
                        return new Backend.Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`, token.line)
                    }

                    tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION', line: token.line })

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
                if(!(nextNextToken.token == 'FLAG' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'MOLANG' || nextNextToken.token == 'CALL' || nextNextToken.token == 'NAME') || !(prevToken.token == 'FLAG' || prevToken.token == 'EXPRESSION' || prevToken.token == 'BOOLEAN' || prevToken.token == 'MOLANG' || prevToken.token == 'CALL' || prevToken.token == 'NAME')){
                    return new Backend.Error(`Can not do operation '${token.value + nextToken.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`, token.line)
                }

                const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' }
                
                tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION', line: token.line })

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
                                return new Backend.Error('Unclosed parantheses!', token.line)
                            }

                            let parsed = buildParamsSingle(tokens.slice(j - 1, endIndex + 1))

                            if(parsed instanceof Backend.Error){
                                return parsed
                            }

                            if(parsed.length != 1){
                                return new Backend.Error('Unexpected symbol (02) ' + parsed[0].value, parsed[0].line)
                            }

                            tokens.splice(j - 1, endIndex - j + 2, parsed[0])
                        }
                    }
                }

                let opensFound = 0

                let endIndex = -1

                let openFoundLine = -1

                for(let u = i + 1; u < tokens.length; u++){
                    const otherOtherToken = tokens[u]

                    if(otherOtherToken.token == 'SYMBOL' && otherOtherToken.value == '('){
                        if(openFoundLine == -1){
                            openFoundLine = otherOtherToken.line
                        }

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

                if(openFoundLine == -1){
                    openFoundLine = token.line
                }

                if(opensFound != 0 || endIndex == -1){
                    return new Backend.Error('Unclosed parantheses!', openFoundLine)
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
                            return new Backend.Error('Unexpected symbol (03) ' + group[0].value, goalToken.line)
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
                    return new Backend.Error('Unexpected symbol (04) ' + group[0].value, group[0].line)
                }

                groups.push(group[0])

                groups.unshift(prevToken)

                tokens.splice(i - 1, endIndex - i + 2, { value: groups, token: 'CALL', line: prevToken.line })
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

function buildAssignments(tokens){
    for(let l = 0; l < tokens.length; l++){
        //Go Deeper Into Blocks
        for(let i = 0; i < tokens[l].length; i++){
            if(tokens[l][i].token == 'BLOCK'){
                let deep = buildAssignments(tokens[l][i].value)

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
                if(Native.complexTypeToSimpleType(nextNextToken.token, nextNextToken) != 'BOOLEAN'){
                    return new Backend.Error('Can\'t assign flag to ' + nextNextToken.token + '!', token.line)
                }
                
                tokens[l].splice(i, 3, { value: [token, nextNextToken], token: 'ASSIGN', line: token.line })
            }
        }
        
        //Build Variable Asignments
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i]
            const nextToken = tokens[l][i + 1]
            const nextNextToken = tokens[l][i + 2]

            if(token.token == 'VAR' && nextToken && nextToken.token == 'SYMBOL' && nextToken.value == '=' && nextNextToken){
                if(Native.complexTypeToSimpleType(nextNextToken.token, nextNextToken) != 'INTEGER'){
                    return new Backend.Error('Can\'t assign variable to ' + nextNextToken.token + '!', token.line)
                }
                
                tokens[l].splice(i, 3, { value: [token, nextNextToken], token: 'ASSIGN', line: token.line })
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
            const token = tokens[l][i] //if
            const nextToken = tokens[l][i + 1] //(
            const nextNextToken = tokens[l][i + 2] //Expression
            const nextNextNextToken = tokens[l][i + 3] //)
            const nextNextNextNextToken = tokens[l][i + 4] // =>
            const nextNextNextNextNextToken = tokens[l][i + 5] // Block

            if(token.token == 'KEYWORD' && token.value == 'if' || token.value == 'fif' && nextToken && nextToken.token == 'SYMBOL' && nextToken.value == '(' && nextNextToken && nextNextNextToken && nextNextNextToken.token == 'SYMBOL' && nextNextNextToken.value == ')' && nextNextNextNextToken && nextNextNextNextToken.token == 'ARROW' && nextNextNextNextNextToken && nextNextNextNextNextToken.token == 'BLOCK'){
                if(!(nextNextToken.token == 'FLAG' || nextNextToken.token == 'NAME' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'MOLANG' || nextNextToken.token == 'CALL')){
                    return new Backend.Error(`If condition can't be ${nextNextToken.token}!`, token.line)
                }

                for(let j = 0; j < nextNextNextNextNextToken.value.length; j++){
                    if(nextNextNextNextNextToken.value[j].length != 1){
                        return new Backend.Error('Unexpected symbol (06A) ' + nextNextNextNextNextToken.value[j][0].value, nextNextNextNextNextToken.value[j][0].line)
                    }else if(nextNextNextNextNextToken.value[j].length == 0){
                        nextNextNextNextNextToken.value[j].splice(l, 1)
                        l--
                    }else{
                        nextNextNextNextNextToken.value[j] = nextNextNextNextNextToken.value[j][0]
                    }
                }
                
                if(token.value == 'if'){
                    tokens[l].splice(i, 6, { value: [nextNextToken, nextNextNextNextNextToken], token: 'IF', line: token.line })
                }else{
                    tokens[l].splice(i, 6, { value: [nextNextToken, nextNextNextNextNextToken], token: 'FIF', line: token.line })
                }
            }
        }
        
        for(let i = 0; i < tokens[l].length; i++){
            const token = tokens[l][i] //else
            const nextToken = tokens[l][i + 1] // =>
            const nextNextToken = tokens[l][i + 2] //BLOCK

            if(token.token == 'KEYWORD' && token.value == 'else' && nextToken && nextToken.token == 'ARROW' && nextNextToken && nextNextToken.token == 'BLOCK'){
                for(let j = 0; j < nextNextToken.value.length; j++){
                    if(nextNextToken.value[j].length != 1){
                        return new Backend.Error('Unexpected symbol (06C) ' + nextNextToken.value[j][0].value, nextNextToken.value[j][0].line)
                    }else if(nextNextToken.value[j].length == 0){
                        nextNextToken.value[j].splice(l, 1)
                        l--
                    }else{
                        nextNextToken.value[j] = nextNextToken.value[j][0]
                    }
                }
                
                tokens[l].splice(i, 6, { value: [nextNextToken], token: 'ELSE', line: token.line })
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
                    return new Backend.Error(`Delay must be an integer!`, token.line)
                }

                for(let j = 0; j < nextNextNextNextNextToken.value.length; j++){
                    if(nextNextNextNextNextToken.value[j].length != 1){
                        return new Backend.Error('Unexpected symbol (06B) ' + nextNextNextNextNextToken.value[j][0].value, nextNextNextNextNextToken.value[j][0].line)
                    }else if(nextNextNextNextNextToken.value[j].length == 0){
                        nextNextNextNextNextToken.value[j].splice(l, 1)
                        l--
                    }else{
                        nextNextNextNextNextToken.value[j] = nextNextNextNextNextToken.value[j][0]
                    }
                }
                
                tokens[l].splice(i, 6, { value: [nextNextToken, nextNextNextNextNextToken], token: 'DELAY', line: token.line })
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
                
                tokens[l].splice(i, 6, { value: [nextToken, nextNextNextToken], token: 'DEFINITION', line: token.line })
            }
        }
    }

    return tokens
}

/* 
    INTEGER
    SYMBOL
    KEYWORD
    BOOLEAN
    NAME
    STRING
    BLOCK
    FLAG
    VAR
    MOLANG
    ARROW
    CALL
    EXPRESSION
    ASSIGN
    IF
    FIF
    DELAY
    DEFINITON
    ELSE
*/

function validateTree(tokens, gloabalScope){
    for(let l = 0; l < tokens.length; l++){
        let deep = null

        switch(tokens[l].token){
            case 'BLOCK':
                return new Backend.Error('Blocks may not exist by themselves!', tokens[l].line)
            case 'DEFINITION':
                if(!gloabalScope){
                    return new Backend.Error('Can\'t define function not in the global scope!', tokens[l].line)
                }

                deep = validateTree(tokens[l].value[1].value, false)

                if(deep instanceof Backend.Error){
                    return deep
                }

                break
            case 'ASSIGN':
                if(gloabalScope){
                    if(tokens[l].value[0].token == 'FLAG'){
                        return new Backend.Error('Can\'t assign flags in the global scope!', tokens[l].line)
                    }else if(tokens[l].value[0].token == 'VAR'){
                        return new Backend.Error('Can\'t assign variables in the global scope!', tokens[l].line)
                    }
                }
                break
            case 'IF':
                if(gloabalScope){
                    return new Backend.Error('Can\'t use if statements in the global scope!', tokens[l].line)
                }

                deep = validateTree(tokens[l].value[1].value, false)

                if(deep instanceof Backend.Error){
                    return deep
                }
                
                break
            case 'FIF':
                if(gloabalScope){
                    return new Backend.Error('Can\'t use fif statements in the global scope!', tokens[l].line)
                }

                deep = validateTree(tokens[l].value[1].value, false)

                if(deep instanceof Backend.Error){
                    return deep
                }
                
                break
            case 'ELSE':
                    if(gloabalScope){
                        return new Backend.Error('Can\'t use else statements in the global scope!', tokens[l].line)
                    }

                    if(!tokens[l - 1] || (tokens[l - 1].token != 'IF' && tokens[l - 1].token != 'FIF')){
                        return new Backend.Error('Else statements must be after an if statement!', tokens[l].line)
                    }
    
                    deep = validateTree(tokens[l].value[0].value, false)
    
                    if(deep instanceof Backend.Error){
                        return deep
                    }
                    
                    break
            case 'DELAY':
                if(gloabalScope){
                    return new Backend.Error('Can\'t use delay statements in the global scope!', tokens[l].line)
                }

                deep = validateTree(tokens[l].value[1].value, false)

                if(deep instanceof Backend.Error){
                    return deep
                }

                break
            case 'CALL':
                if(gloabalScope){
                    return new Backend.Error('Can\'t use calls in the global scope!', tokens[l].line)
                }
                break
            case 'EXPRESSION':
                return new Backend.Error('Expressions may not exist by themselves!', tokens[l].line)
            case 'INTEGER':
                return new Backend.Error('Integers may not exist by themselves!', tokens[l].line)
            case 'SYMBOL':
                return new Backend.Error('Symbols may not exist by themselves!', tokens[l].line)
            case 'KEYWORD':
                return new Backend.Error('Keywords may not exist by themselves!', tokens[l].line)
            case 'BOOLEAN':
                return new Backend.Error('Booleans may not exist by themselves!', tokens[l].line)
            case 'NAME':
                return new Backend.Error('Names may not exist by themselves!', tokens[l].line)
            case 'STRING':
                return new Backend.Error('Strings may not exist by themselves!', tokens[l].line)
            case 'FLAG':
                return new Backend.Error('Flags may not exist by themselves!', tokens[l].line)
            case 'VAR':
                return new Backend.Error('Variables may not exist by themselves!', tokens[l].line)
            case 'MOLANG':
                return new Backend.Error('Molangs may not exist by themselves!', tokens[l].line)
            case 'ARROW':
                return new Backend.Error('Arrows may not exist by themselves!', tokens[l].line)
            default:
                return new Backend.Error('Unknown token type: ' + tokens[l].token, tokens[l].line)
        }
    }

    return tokens
}

export function GenerateETree(tokens){
    tokens = splitLines(tokens)

    tokens = buildStrings(tokens)

    if(tokens instanceof Backend.Error){
        return tokens
    }

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
        return new Backend.Error('File was empty!', 0)
    }

    tokens = buildParams(tokens)

    if(tokens instanceof Backend.Error){
        return tokens
    }

    tokens = buildExpressions(tokens)

    if(tokens instanceof Backend.Error){
        return tokens
    }

    tokens = buildAssignments(tokens)

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
            return new Backend.Error('Unexpected symbol (05) ' + tokens[l][0].value, tokens[l][0].line)
        }else if(tokens[l].length == 0){
            tokens[l].splice(l, 1)
            l--
        }else{
            tokens[l] = tokens[l][0]
        }
    }

    tokens = validateTree(tokens, true)

    if(tokens instanceof Backend.Error){
        return tokens
    }

    console.log(JSON.parse(JSON.stringify(tokens)))

    return tokens
}