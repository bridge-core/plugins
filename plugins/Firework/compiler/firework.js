(function () {
    'use strict';

    class Error{
        constructor(message){
            this.message = message;
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
                        console.log(params);
                        console.log(params[0]);
                        console.log(params[0].value);
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

            for(const i in functions[name].variations){
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

    function Compile(tree, config, source){
        //#region NOTE: Setup json values for editing DONE
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


        //#region NOTE: Create variables to be added to durring overviewing the execution tree DONE
        let blocks = {};

        let delays = {};

        let dynamicValues = {};

        let flags = [];

        let delaySteps = [];
        //#endregion

        //#region NOTE: Expression to molang to be used in setting values DONE
        function expressionToMolang(expression){
            let result = '';

            if(expression.token == 'INTEGER' || expression.token == 'BOOLEAN'){
                result = expression.value;
            }else if(expression.token == 'MOLANG'){
                result = '(' + expression.value + ')';
            }else if(expression.token == 'EXPRESSION'){
                if(expression.value[0].value == '!'){
                    const deep = expressionToMolang(expression.value[1]) + ' == 0';

                    if(deep instanceof Error){
                        return deep
                    }

                    result = '(' + deep + ')';
                }else {
                    const deep = expressionToMolang(expression.value[1]) + ' ' + expression.value[0].value + ' ' + expressionToMolang(expression.value[2]);

                    if(deep instanceof Error){
                        return deep
                    }

                    result = '(' + deep + ')';
                }
            }else if(expression.token == 'FLAG'){
                result = `(q.actor_property('frw:${expression.value}'))`;
            }else if(expression.token == 'CALL'){
                if(!doesFunctionExist(expression.value[0].value)){
                    return new Error(`Method '${expression.value[0].value}' does not exist!`)
                }

                if(!doesFunctionSupportMolang(expression.value[0].value)){
                    return new Error(`Method '${expression.value[0].value}' is not supported in expression!`)
                }

                if(!doesFunctionExistWithTemplate(expression.value[0].value, expression.value.slice(1))){
                    return new Error(`Method '${expression.value[0].value}' does not match any template!`)
                }

                result = getFunction(expression.value[0].value, expression.value.slice(1));
            }else {
                return new Error('Unknown expression token: ' + expression.token + '!')
            }

            return result
        }

        function indexFlag(flag){
            if(!flags.includes(flag.value)){
                flags.push(flag.value);
            }
        }
        //#endregion

        
        //#region NOTE: Optimizes expressions for molang
        function optimizeExpression(expression){
            let dynamic = false;

            if(expression.token == 'SYMBOL' && (expression.value[0].value == '+' || expression.value[0].value == '-' || expression.value == '*'[0].value || expression.value == '/'[0].value || expression.value[0].value == '&&' || expression.value[0].value == '||' || expression.value[0].value == '==' || expression.value[0].value == '>' || expression.value[0].value == '<' || expression.value[0].value == '>=' || expression.value[0].value == '<=')){
                if(expression.value[1].token == 'EXPRESSION'){
                    const deep = optimizeExpression(expression.value[1]);

                    if(deep instanceof Error){
                        return deep
                    }

                    expression.value[1] = deep;
                }

                if(expression.value[2].token == 'EXPRESSION'){
                    const deep = optimizeExpression(expression.value[2]);

                    if(deep instanceof Error){
                        return deep
                    }

                    expression.value[2] = deep;
                }
                
                if(expression.value[1].dynamic || expression.value[2].dynamic){
                    dynamic = true;
                }

                if(expression.value[1].token == 'FLAG' || expression.value[2].token == 'FLAG'){
                    if(expression.value[1].token == 'FLAG'){
                        indexFlag(expression.value[1]);
                    }

                    if(expression.value[2].token == 'FLAG'){
                        indexFlag(expression.value[2]);
                    }

                    dynamic = true;
                }

                if(expression.value[1].token == 'MOLANG' || expression.value[2].token == 'MOLANG'){
                    dynamic = true;
                }
            }else if(expression.token == 'SYMBOL' && (expression.value[0].value == '!')){
                if(expression.value[1].token == 'EXPRESSION'){
                    const deep = optimizeExpression(expression.value[1]);

                    if(deep instanceof Error){
                        return deep
                    }

                    expression.value[1] = deep;
                }

                if(expression.value[1].dynamic){
                    dynamic = true;
                }

                if(expression.value[1].token == 'FLAG'){
                    dynamic = true;

                    indexFlag(expression.value[1]);
                }

                if(expression.value[1].token == 'MOLANG'){
                    dynamic = true;
                }
            }

            if(dynamic){
                expression.dynamic = true;
            }else {
                if(expression.value[0].value == '+'){
                    if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                        return new Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                    }

                    expression = { value: (parseInt(expression.value[1].value) + parseInt(expression.value[2].value)).toString(), token: 'INTEGER' };
                }else if(expression.value[0].value == '-'){
                    if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                        return new Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                    }

                    expression = { value: (parseInt(expression.value[1].value) - parseInt(expression.value[2].value)).toString(), token: 'INTEGER' };
                }else if(expression.value[0].value == '*'){
                    if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                        return new Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                    }

                    expression = { value: (parseInt(expression.value[1].value) * parseInt(expression.value[2].value)).toString(), token: 'INTEGER' };
                }else if(expression.value[0].value == '+'){
                    if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                        return new Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                    }

                    expression = { value: (parseInt(expression.value[1].value) / parseInt(expression.value[2].value)).toString(), token: 'FLOAT' };
                }else if(expression.value[0].value == '>'){
                    if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                        return new Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                    }

                    expression = { value: (parseInt(expression.value[1].value) > parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' };
                }else if(expression.value[0].value == '<'){
                    if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                        return new Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                    }

                    expression = { value: (parseInt(expression.value[1].value) < parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' };
                }else if(expression.value[0].value == '>='){
                    if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                        return new Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                    }

                    expression = { value: (parseInt(expression.value[1].value) >= parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' };
                }else if(expression.value[0].value == '<='){
                    if(!(expression.value[1].token == 'INTEGER' && expression.value[2].token == 'INTEGER')){
                        return new Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                    }

                    expression = { value: (parseInt(expression.value[1].value) <= parseInt(expression.value[2].value)).toString(), token: 'BOOLEAN' };
                }else if(expression.value[0].value == '&&'){
                    if(!(expression.value[1].token == 'BOOLEAN' || expression.value[1].token == 'MOLANG' || expression.value[1].token == 'FLAG') || !(expression.value[2].token == 'BOOLEAN' || expression.value[2].token == 'MOLANG' || expression.value[2].token == 'FLAG')){
                        return new Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                    }

                    expression = { value: (expression.value[1].value == 'true' && expression.value[2].value == 'true').toString(), token: 'BOOLEAN' };
                }else if(expression.value[0].value == '||'){
                    if(!(expression.value[1].token == 'BOOLEAN' || expression.value[1].token == 'MOLANG' || expression.value[1].token == 'FLAG') || !(expression.value[2].token == 'BOOLEAN' || expression.value[2].token == 'MOLANG' || expression.value[2].token == 'FLAG')){
                        return new Error(`Can not do operation ${expression.value[0].value} between types ${expression.value[1].token} and ${expression.value[2].token}!`)
                    }

                    expression = { value: (expression.value[1].value == 'true' || expression.value[2].value == 'true').toString(), token: 'BOOLEAN' };
                }else if(expression.value[0].value == '!'){
                    if(!(expression.value[1].token == 'BOOLEAN' || expression.value[1].token == 'MOLANG' || expression.value[1].token == 'FLAG')){
                        return new Error(`Can not do operation ${expression.value[0].value} on type ${expression.value[1].token}!`)
                    }

                    expression = { value: (expression.value[1].value != 'true').toString(), token: 'BOOLEAN' };
                }else if(expression.value[0].value == '=='){
                    if(expression.value[1].token != expression.value[2].token){
                        expression = { value: 'false', token: 'BOOLEAN' };
                    }else {
                        expression = { value: (expression.value[1].value == expression.value[2].value).toString(), token: 'BOOLEAN' };
                    }
                }
            }

            return expression
        }
        //#endregion


        //#region NOTE: Util Functions
        function searchForExpression(tree){
            if(tree.token == 'DEFINITION' || tree.token == 'IF' || tree.token == 'DELAY'){
                const deep = searchForExpression(tree.value[1].value);
                
                if(deep instanceof Error){
                    return deep
                }

                tree.value[1].value = deep;
            }else if(tree.token == 'CALL'){
                for(let i = 1; i < tree.value.length; i++){
                    if(tree.value[i].token == 'EXPRESSION'){
                        const deep = optimizeExpression(tree.value[i]);

                        if(deep instanceof Error){
                            return deep
                        }

                        tree.value[i] = deep;
                    }
                }
            }

            return tree
        }
       
        function indexCodeBlock(block, mode, condition = null, preferedID = null){
            for(let i = 0; i < block.value.length; i++){
                const deep = searchForCodeBlock(block.value[i]);

                if(deep instanceof Error){
                    return deep
                }

                block.value[i] = deep;
            }

            let ID = uuidv4();

            if(preferedID != null && !blocks[preferedID]){
                ID = preferedID;
            }

            if(mode == 'conditional'){
                const deep = expressionToMolang(condition);

                if(deep instanceof Error){
                    return deep
                }

                dynamicValues[ID] = {
                    condition: deep
                };
            }else if(mode == 'delay'){
                if(condition.token != 'INTEGER'){
                    return new Error(`Delay must be an integer!`)
                }

                if(parseInt(condition.value) <= 0){
                    return new Error(`Delay must be greater than 0!`)
                }

                delays[ID] = parseInt(condition.value);
            }

            blocks[ID] = block.value;

            block = { value: [ID, mode], token: 'BLOCKREF'};

            return block
        }

        function searchForCodeBlock(tree){
            if(tree.token == 'DEFINITION'){
                const deep = indexCodeBlock(tree.value[1], 'normal', null, tree.value[0].value);

                if(deep instanceof Error){
                    return deep
                }

                tree.value[1] = deep;
            }else if(tree.token == 'IF'){
                const deep = indexCodeBlock(tree.value[1], 'conditional', tree.value[0]);

                if(deep instanceof Error){
                    return deep
                }

                tree.value[1] = deep;
            }else if(tree.token == 'DELAY'){
                const deep = indexCodeBlock(tree.value[1], 'delay', tree.value[0]);

                if(deep instanceof Error){
                    return deep
                }

                tree.value[1] = deep;
            }

            return tree
        }

        function searchForFlags(tree){
            if(tree.token == 'DEFINITION' || tree.token == 'IF' || tree.token == 'DELAY'){
                if(tree.value[0].token == 'EXPRESSION'){
                    const deep = searchForFlags(tree.value[0]);

                    if(deep instanceof Error){
                        return deep
                    }

                    tree.value[0] = deep;
                }else if(tree.value[0].token == 'FLAG'){
                    indexFlag(tree.value[0]);
                }

                for(let i = 0; i < tree.value[1].value.length; i++){
                    const deep = searchForFlags(tree.value[1].value[i]);

                    if(deep instanceof Error){
                        return deep
                    }

                    tree.value[1].value[i] = deep;
                }
            }else if(tree.token == 'ASSIGN' && tree.value[0].token == 'FLAG'){
                indexFlag(tree.value[0]);
            }

            return tree
        }
        //#endregion


        //#region NOTE: Do All The Searching Indexing And Optimization 
        for(let i = 0; i < tree.length; i++){
            const deep = searchForExpression(tree[i]);

            if(deep instanceof Error){
                return deep
            }

            tree[i] = deep;
        }

        for(let i = 0; i < tree.length; i++){
            const deep = searchForFlags(tree[i]);

            if(deep instanceof Error){
                return deep
            }

            tree[i] = deep;
        }

        for(let i = 0; i < tree.length; i++){
            const deep = searchForCodeBlock(tree[i]);

            if(deep instanceof Error){
                return deep
            }

            tree[i] = deep;
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
            };

            worldRuntime['minecraft:entity'].description.properties['frw:' + flags[i]] = data;

            let eventData = {
                set_actor_property: {},
                run_command: {
                    command: []
                }
            };
            
            eventData.set_actor_property['frw:' + flags[i]] = 1;
            eventData.run_command.command.push(`tag @s add frw:${flags[i]}`);

            worldRuntime['minecraft:entity'].events['frw:set_' + flags[i]] = eventData;

            eventData = {
                set_actor_property: {},
                run_command: {
                    command: []
                }
            };
            
            eventData.set_actor_property['frw:' + flags[i]] = 0;
            eventData.run_command.command.push(`tag @s remove frw:${flags[i]}`);

            worldRuntime['minecraft:entity'].events['frw:unset_' + flags[i]] = eventData;
        }
        //#endregion


        //#region NOTE: Create animations for dynamic values like if params and dynamic flags
        const dynamicValueNames = Object.getOwnPropertyNames(dynamicValues);

        //TODO: Make reliable
        for(let i = 0; i < dynamicValueNames.length; i++){
            let data = {
                default: 0,
                values: [
                    0,
                    1
                ]
            };

            worldRuntime['minecraft:entity'].description.properties['frw:' + dynamicValueNames[i]] = data;

            let animCont = {
                "format_version": "1.10.0",
                "animations": {}
            };

            animCont.animations['animation.firework.runtime.' + dynamicValueNames[i]] = {
                "loop": true,
                "timeline": {
                    "0.0": [
                        `/tag @s add frw_conditional_${dynamicValueNames[i]}`
                    ]
                },
                "animation_length": 0.001
            };

            outAnimations['frw_' + dynamicValueNames[i] + '.json'] = JSON.stringify(animCont, null, 4);

            worldRuntime['minecraft:entity'].description.animations[dynamicValueNames[i]] = 'animation.firework.runtime.' + dynamicValueNames[i];

            let animData = {};

            animData[dynamicValueNames[i]] = dynamicValues[dynamicValueNames[i]].condition;

            worldRuntime['minecraft:entity'].description.scripts.animate.push(animData);

            animCont = {
                "format_version": "1.10.0",
                "animations": {}
            };

            animCont.animations['animation.firework.runtime.' + dynamicValueNames[i] + '.inverse'] = {
                "loop": true,
                "timeline": {
                    "0.0": [
                        `/tag @s remove frw_conditional_${dynamicValueNames[i]}`
                    ]
                },
                "animation_length": 0.001
            };

            outAnimations['frw_' + dynamicValueNames[i] + '_inverse.json'] = JSON.stringify(animCont, null, 4);

            worldRuntime['minecraft:entity'].description.animations[dynamicValueNames[i] + '_inverse'] = 'animation.firework.runtime.' + dynamicValueNames[i] + '.inverse';

            animData = {};

            animData[dynamicValueNames[i] + '_inverse'] = '(' + dynamicValues[dynamicValueNames[i]].condition + ') == 0';

            worldRuntime['minecraft:entity'].description.scripts.animate.push(animData);
        }
        //#endregion


        //#region NOTE: Add code blocks as events to entities
        const blockNames = Object.getOwnPropertyNames(blocks);

        for(let i = 0; i < blockNames.length; i++){
            let data = {
                sequence: []
            };

            for(let l = 0; l < blocks[blockNames[i]].length; l++){
                if(blocks[blockNames[i]][l].token == 'CALL'){
                    const callName = blocks[blockNames[i]][l].value[0].value;
                    const callParams = blocks[blockNames[i]][l].value.slice(1);

                    if(doesFunctionExist(callName)){
                        if(!doesFunctionSupportEntity(callName)){
                            return new Error(`Method '${callName}' is not supported in code blocks!`)
                        }
            
                        if(!doesFunctionExistWithTemplate(callName, callParams)){
                            return new Error(`Method '${callName}' does not match any template!`)
                        }

                        data.sequence.push(getFunction(callName, callParams));
                    }else if(blocks[callName]){
                        data.sequence.push({
                            run_command: {
                                command: [
                                    `event entity @s frw:${callName}`
                                ]
                            }
                        });
                    }else {
                        return new Error(`Method '${callName}' does not exist!`)
                    }
                }else if(blocks[blockNames[i]][l].token == 'DEFINITION' || blocks[blockNames[i]][l].token == 'IF' || blocks[blockNames[i]][l].token == 'DELAY'){
                    if(blocks[blockNames[i]][l].value[1].value[1] == 'normal'){
                        data.sequence.push({
                            run_command: {
                                command: [
                                    'event entity @s frw:' + blocks[blockNames[i]][l].value[1].value[0]
                                ]
                            }
                        });
                    }else if(blocks[blockNames[i]][l].value[1].value[1] == 'conditional'){
                        data.sequence.push({
                            run_command: {
                                command: [
                                    `event entity @s[tag=frw_conditional_${blocks[blockNames[i]][l].value[1].value[0]}] frw:` + blocks[blockNames[i]][l].value[1].value[0]
                                ]
                            }
                        });
                    }else if(blocks[blockNames[i]][l].value[1].value[1] == 'delay'){           
                        //Delay Intialization
                        data.sequence.push({
                            run_command: {
                                command: [
                                    'event entity @s frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_trigger'
                                ]
                            }
                        });

                        //Delay Triggering
                        for(let j = 0; j < config.delayChannels; j++){
                            let channelData = {
                                run_command: {
                                    command: [
                                        `tag @s add frw_${blocks[blockNames[i]][l].value[1].value[0]}_time_${delays[blocks[blockNames[i]][l].value[1].value[0]]}_channel_${j}`,
                                        'tag @s add added'
                                    ]
                                }
                            };

                            worldRuntime['minecraft:entity'].events['frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_channel_' + j.toString()] = channelData;
                        }

                        //Delay Channel Choosing
                        let delayCallData = {
                            run_command: {
                                command: [
                                ]
                            }
                        };

                        for(let j = 0; j < config.delayChannels; j++){
                            delayCallData.run_command.command.push(`event entity @s[tag=!added, tag=!frw_${blocks[blockNames[i]][l].value[1].value[0]}_time_${delays[blocks[blockNames[i]][l].value[1].value[0]]}_channel_${j}] ${'frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_channel_' + j.toString()}`);
                        }

                        delayCallData.run_command.command.push(`tag @s remove added`);

                        worldRuntime['minecraft:entity'].events['frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_trigger'] = delayCallData;

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
                                };

                                if(k == 1){
                                    timeData.run_command.command = [
                                        `tag @s remove frw_${blocks[blockNames[i]][l].value[1].value[0]}_time_${k}_channel_${j}`,
                                        `event entity @s frw:${blocks[blockNames[i]][l].value[1].value[0]}`
                                    ];
                                }
        
                                worldRuntime['minecraft:entity'].events['frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_time_' + k.toString() + '_channel_' + j.toString()] = timeData;
                            }
                        }

                        //Add Delay Stepping
                        for(let j = 0; j < config.delayChannels; j++){
                            for(let k = delays[blocks[blockNames[i]][l].value[1].value[0]]; k > 0; k--){
                                delaySteps.unshift(`event entity @s[tag=frw_${blocks[blockNames[i]][l].value[1].value[0] + '_time_' + k.toString() + '_channel_' + j.toString()}] ${'frw:' + blocks[blockNames[i]][l].value[1].value[0] + '_time_' + k.toString() + '_channel_' + j.toString()}`);
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
                        );
                    }else {
                        data.sequence.push(
                            {
                                run_command: {
                                    command: [
                                        `event entity @s frw:unset_${blocks[blockNames[i]][l].value[0].value}`
                                    ]
                                }
                            }
                        );
                    }
                }
            }

            worldRuntime['minecraft:entity'].events['frw:' + blockNames[i]] = data;
        }
        //#endregion


        //#region NOTE: Setup delay steps DONE
        worldRuntime['minecraft:entity'].events['frwb:delay'] = {
            run_command: {
                command: delaySteps
            }
        };
        //#endregion


        return {
            animations: outAnimations,
            entity: worldRuntime
        }
    }

    function splitLines(tokens){
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

        for(let x = 0; x < tokens.length; x++){
            for(let y = 0; y < tokens[x].length; y++){
                if(tokens[x][y].value == '{' && tokens[x][y].token == 'SYMBOL'){
                    openPaths.push({ x: x, y: y });
                }

                if(tokens[x][y].value == '}' && tokens[x][y].token == 'SYMBOL'){
                    let openPath = openPaths.pop();

                    if(!openPath){
                        return new Error('Unexpected }!')
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

                    tokens[openPath.x].splice(openPath.y, tokens[openPath.x].length, { value: inBlockLines, token: 'BLOCK' });

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
          return new Error('Unclosed \'{\'!')
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

            //Remove Whitespace and Create Strings
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];

                if(token.token == 'SYMBOL' && (token.value == '"' || token.value == "'")){
                    inString = !inString;

                    if(inString){
                        inStringIndex = i;
                    }else {            
                        let tokensInString = tokens[l].slice(inStringIndex + 1, i);

                        let resultString = '';

                        for(let j = 0; j < tokensInString.length; j++){
                            resultString += tokensInString[j].value;
                        }

                        tokens[l].splice(inStringIndex, i - inStringIndex + 1, { value: resultString, token: 'STRING' });

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
              return new Error('Unclosed string!')
            }

            //Combine Numbers
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];

                if(token.token == 'INTEGER'){
                    let nextToken = tokens[l][i + 1];

                    if(nextToken && nextToken.token == 'INTEGER'){
                        tokens[l].splice(i, 2, { value: token.value + nextToken.value, token: 'INTEGER' });

                        i--;
                    }
                }
            }

            //Build Flags
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const prevToken = tokens[l][i - 1];

                if(token.token == 'NAME' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '$'){
                    tokens[l].splice(i - 1, 2, { value: token.value, token: 'FLAG' });

                    i--;
                }
            }

            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];

                if(token.token == 'SYMBOL' && token.value == '$'){
                    return new Error('Unexpected symbol \'$\'!')
                }
            }

            //Build Molang
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const prevToken = tokens[l][i - 1];

                if(token.token == 'STRING' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '?'){
                    tokens[l].splice(i - 1, 2, { value: token.value, token: 'MOLANG' });

                    i--;
                }
            }

            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];

                if(token.token == 'SYMBOL' && token.value == '?'){
                    return new Error('Unexpected symbol \'?\'!')
                }
            }

            //Build Arrows
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const prevToken = tokens[l][i - 1];

                if(token.token == 'SYMBOL' && token.value == '>' && prevToken && prevToken.token == 'SYMBOL' && prevToken.value == '='){
                    tokens[l].splice(i - 1, 2, { value: '=>', token: 'ARROW' });

                    i--;
                }
            }

            //Build Empty Function Calls
            for(let i = 0; i < tokens[l].length; i++){
                const token = tokens[l][i];
                const nextToken = tokens[l][i + 1];
                const nextNextToken = tokens[l][i + 2];

                if(token.token == 'NAME' && nextToken && nextToken.value == '(' && nextNextToken && nextNextToken.value == ')'){
                    tokens[l].splice(i, 3, { value: [token], token: 'CALL' });
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
                        return new Error('Unclosed parantheses!')
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
                        return new Error('Unresolved symbols 01:\n' + JSON.stringify(deep, null, 2))
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
                        return new Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`)
                    }

                    tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION' });

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
                        return new Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`)
                    }
                    
                    tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION' });

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
                        return new Error(`Can not do operation '${token.value}' with '${nextToken.token}'!`)
                    }

                    tokens.splice(i, 2, { value: [token, nextToken], token: 'EXPRESSION' });
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
                                return new Error(`Can not do operation '${token.value + nextToken.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`)
                            }
                            
                            const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' };
                            
                            tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION' });

                            i--;
                        }else {
                            if(!(nextNextToken.token == 'INTEGER' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'FLAG' || nextNextToken.token == 'MOLANG' || nextNextToken.token == 'NAME') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'BOOLEAN' || prevToken.token == 'FLAG' || prevToken.token == 'MOLANG' || prevToken.token == 'NAME')){
                                return new Error(`Can not do operation '${token.value + nextToken.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`)
                            }

                            const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' };

                            tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION' });

                            i--;
                        }
                    }else if(token.value == '>' || token.value == '<'){
                        if(!(nextToken.token == 'INTEGER' || nextToken.token == 'EXPRESSION' || nextNextToken.token == 'NAME') || !(prevToken.token == 'INTEGER' || prevToken.token == 'EXPRESSION' || prevToken.token == 'NAME')){
                            return new Error(`Can not do operation '${token.value}' with '${nextToken.token}' and '${prevToken.token}'!`)
                        }

                        tokens.splice(i - 1, 3, { value: [token, prevToken, nextToken], token: 'EXPRESSION' });

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
                    if(!(nextNextToken.token == 'FLAG' || nextNextToken.token == 'EXPRESSION' || nextNextToken.token == 'BOOLEAN' || nextNextToken.token == 'MOLANG' || nextNextToken.token == 'CALL') || !(prevToken.token == 'FLAG' || prevToken.token == 'EXPRESSION' || prevToken.token == 'BOOLEAN' || prevToken.token == 'MOLANG' || prevToken.token == 'CALL')){
                        console.log(tokens);
                        return new Error(`Can not do operation '${token.value + nextToken.value}' with '${nextNextToken.token}' and '${prevToken.token}'!`)
                    }

                    const newToken = { value: token.value + nextToken.value, token: 'SYMBOL' };
                    
                    tokens.splice(i - 1, 4, { value: [newToken, prevToken, nextNextToken], token: 'EXPRESSION'});

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
                                    return new Error('Unclosed parantheses!')
                                }

                                let parsed = buildParamsSingle(tokens.slice(j - 1, endIndex + 1));

                                if(parsed instanceof Error){
                                    return parsed
                                }

                                if(parsed.length != 1){
                                    return new Error('Unresolved symbols 02:\n' + JSON.stringify(parsed, null, 2))
                                }

                                tokens.splice(j - 1, endIndex - j + 2, parsed[0]);
                            }
                        }
                    }

                    let opensFound = 0;

                    let endIndex = -1;

                    for(let u = i + 1; u < tokens.length; u++){
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
                        return new Error('Unclosed parantheses!')
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
                                console.log(group);
                                return new Error('Unresolved symbols 03:\n' + JSON.stringify(group, null, 2))
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
                        return new Error('Unresolved symbols 04:\n' + JSON.stringify(group, null, 2))
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
                        return new Error(`Dynamic can't be assigned to ${nextNextNextToken.token}!`)
                    }

                    tokens[l].splice(i, 4, { value: [token, nextToken, nextNextNextToken], token: 'ASSIGN' });
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
                        return new Error(`If condition can't be ${nextNextToken.token}!`)
                    }
                    
                    for(let j = 0; j < nextNextNextNextNextToken.value.length; j++){
                        nextNextNextNextNextToken.value[j] = nextNextNextNextNextToken.value[j][0];
                    }
                    
                    tokens[l].splice(i, 6, { value: [nextNextToken, nextNextNextNextNextToken], token: 'IF' });
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
                        return new Error(`Delay must be an integer!`)
                    }
                    
                    for(let j = 0; j < nextNextNextNextNextToken.value.length; j++){
                        nextNextNextNextNextToken.value[j] = nextNextNextNextNextToken.value[j][0];
                    }
                    
                    tokens[l].splice(i, 6, { value: [nextNextToken, nextNextNextNextNextToken], token: 'DELAY' });
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
                    
                    tokens[l].splice(i, 6, { value: [nextToken, nextNextNextToken], token: 'DEFINITION' });
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
                        return new Error('Can\'t assign flag to ' + nextNextToken.token + '!')
                    }
                    
                    tokens[l].splice(i, 3, { value: [token, nextNextToken], token: 'ASSIGN' });
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
            return new Error('File was empty!')
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
                return new Error('Unresolved symbols 05:\n' + JSON.stringify(tokens[l], null, 2))
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

    	let dependAnaimtions = {};

    	let entitiesToCompile = [];

    	let inDependMode = false;
    	
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
    							const components = Object.getOwnPropertyNames(content['minecraft:entity'].components);

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

    				const indexedScripts = Object.getOwnPropertyNames(newScripts);

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

    				const entityDependsKeys = Object.getOwnPropertyNames(entityDepends);

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
    					const components = Object.getOwnPropertyNames(fileContent['minecraft:entity'].components);

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
    									throw tree.message
    								}

    								const compiled = Compile(tree, {
    									delayChannels: 3  
    								}, fileContent);

    								if(compiled instanceof Error){
    									throw compiled.message
    								}

    								let animations = Object.getOwnPropertyNames(compiled.animations);

    								let outBPPath = 'development_behavior_packs/' + projectRoot.split('/')[1] + ' BP/';

    								if(!inDependMode){
    									dependAnaimtions[filePath] = animations;
    								}else {
    									if(dependAnaimtions[filePath]){
    										for(const animation of dependAnaimtions[filePath]){
    											//console.log('Removing anim in depend mode: ' + animation)

    											try{
    												outputFileSystem.unlink(outBPPath + 'animations/' + animation);
    											}catch(e){
    												console.log(e);
    											}
    										}
    									}
    								}							

    								for(let i = 0; i < animations.length; i++){
    									if(inDependMode){
    										//console.log('Writing anim in depend mode: ' + animations[i])
    										await outputFileSystem.writeFile(outBPPath + 'animations/' + animations[i], compiled.animations[animations[i]]);
    									}else {
    										outAnimations[animations[i]] = compiled.animations[animations[i]];
    									}
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

    			await outputFileSystem.mkdir(outBPPath + 'animations');

    			let animations = Object.getOwnPropertyNames(outAnimations);

    			for(let i = 0; i < animations.length; i++){
    				await outputFileSystem.writeFile(outBPPath + 'animations/' + animations[i], outAnimations[animations[i]]);
    			}

    			await outputFileSystem.mkdir(outBPPath + 'functions');

    			let mc = 'event entity @e[tag=started2, tag=!started3] frw:start\ntag @e[tag=started2] add started3\ntag @e[tag=started] add started2\ntag @e add started';

    			await outputFileSystem.writeFile(outBPPath + 'functions/firework_runtime.mcfunction', mc);

    			try{
    				let tick = await outputFileSystem.readFile(outBPPath + 'functions/tick.json');

    				tick = JSON.parse(await tick.text());

    				tick.values.push('firework_runtime');

    				await outputFileSystem.writeFile(outBPPath + 'functions/tick.json', JSON.stringify(tick));
    			}catch (ex){
    				//console.log("can't find tick")
    				//console.log(ex)

    				await outputFileSystem.writeFile(outBPPath + 'functions/tick.json', JSON.stringify({
    					values: ['firework_runtime']
    				}));
    			}

    			inDependMode = true;

    			//console.log('Compiling Extra Entities')
    			//console.log(entitiesToCompile)
    			await compileFiles(entitiesToCompile);

    			outAnimations = {};
    			dependAnaimtions = {};

    			entitiesToCompile = [];

    			inDependMode = false;
            },
    	}
    };

})();
