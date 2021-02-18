const fs = await require('@bridge/fs');
const env = await require('@bridge/env');
const { createError } = await require('@bridge/notification')
let currentBPPath = await env.getCurrentBP();
currentBPPath = currentBPPath.replace(/\\/g, '/')
const makeDir = () => {
    return new Promise((resolve, _reject) => {
        resolve(fs.mkdir(currentBPPath+'/animation_controllers/blockTagSensor'))
    })
}
const makeFile = (fileLocation) => {
    return new Promise((resolve, _reject) => {
        resolve(fs.open(fileLocation, 'wx+'))
    })
};
async function createDirAndFile(id,relative_block_position, block_tags, operator, type,event){
    let filePath = currentBPPath+"/animation_controllers/blockTagSensor/"+id+".json";
    if(operator === undefined){
        operator = "==";
    }
    if(type === undefined){
        if(block_tags.length > 1){
            type = "any_tag";
        } else {
            type = "all_tags";
        }
    } else if(type === "all_tags"){
        if(block_tags.length < 2){
            type = "any_tag";
            createError(new Error(`Component "type" cannot be "all_tags" if the number of tags in "block_tags" is less than two, the value of the component has been replaced by "any_tag"`))
        };
    };
    if(!Array.isArray(relative_block_position)){
        relative_block_position = [0,0,0];
    } else {
        for(i = 0; i<3;i++){
            if(typeof relative_block_position[i] !== 'number'){
                relative_block_position[i] = 0;
            };
            relative_block_position[i] = Math.round(relative_block_position[i]);
        };
    };
    for(i=0;i<block_tags.length;i++){
        block_tags[i] = "'"+block_tags[i]+"'";
    };
    let makeMolang = "query.relative_block_has_"+type+"("+relative_block_position[0]+","+relative_block_position[1]+","+relative_block_position[2]+","+block_tags+")"+operator+"1";
    let makeInverseMolang = "query.relative_block_has_"+type+"("+relative_block_position[0]+","+relative_block_position[1]+","+relative_block_position[2]+","+block_tags+")"+operator+"0";
    let makeStateID = Math.random();
    try {
        await makeDir();
    } catch (err){};
    try {
        await makeFile(filePath);
        let jsonTemplate='{\
            "format_version":"1.10.0",\
            "animation_controllers": {\
                "controller.animation.'+id+'": {\
                    "initial_state":"default",\
                    "states": {\
                        "default": {\
                            "transitions": [\
                                {"'+makeStateID+'":"'+makeMolang+'"}\
                            ]\
                        },\
                        "'+makeStateID+'": {\
                            "on_entry":[\
                                "@s '+event+'"\
                            ],\
                            "transitions": [\
                                {"default":"'+makeInverseMolang+'"}\
                            ]\
                        }\
                    }\
                }\
            }\
        }';
        fs.writeJSON(filePath, JSON.parse(jsonTemplate), true)
    } catch (err){
        let controllerAnimation = await fs.readJSON(filePath);
        let default_transition = controllerAnimation.animation_controllers['controller.animation.'+id].states.default.transitions;
        let repeatedMolang = false
        for(i=0;i<default_transition.length;i++){
            if(makeMolang === Object.values(default_transition[i])[0]){
                repeatedMolang = true;
                break;
            };
        };
        if(!repeatedMolang){
            let transitionTemplate = JSON.parse('{"'+makeStateID+'":"'+makeMolang+'"}');
            let stateTemplate = JSON.parse('{"on_entry": ["@s '+event+'"], "transitions": [{ "default": "'+makeInverseMolang+'"}]}');
            controllerAnimation.animation_controllers['controller.animation.'+id].states.default.transitions.push(transitionTemplate);
            controllerAnimation.animation_controllers['controller.animation.'+id].states[makeStateID] = stateTemplate;
            fs.writeJSON(filePath, controllerAnimation, true);
        }
    }
}
Bridge.register(
    class EntityComponent {
        static component_name = 'bridge:block_tag_sensor';
        static type = 'entity';
        onApply(arrayData){
            let error = false
            let animationTemplate = {
                description: {
                    animations: {},
                    scripts: {
                        animate: []
                    }
                }
            }
            let cycle = 0
            arrayData.map((data) => {
                let components_array = [data.id,data.block_tags,data.event]
                let id = data.id
                for(i = 0; i < components_array.length; i++){
                    if(components_array[i] === undefined){
                        error = true;
                        i = components_array.length;
                    };
                };
                if(!error){
                    let repeatedScript = false
                    createDirAndFile(id, data.relative_block_position,data.block_tags,data.operator, data.type, data.event);
                    animationTemplate.description.animations['bridge.'+id+'.animation'] = 'controller.animation.'+id;
                    let numberWhile = 0
                    if(cycle !== 0){
                        while(numberWhile<animationTemplate.description.scripts.animate.length){
                            if(animationTemplate.description.scripts.animate[numberWhile] === 'bridge.'+id+'.animation'){
                                repeatedScript = true;
                                break;
                            };
                            numberWhile++;
                        };
                        if(!repeatedScript){
                            animationTemplate.description.scripts.animate.push('bridge.'+id+'.animation')
                        };
                    } else {
                        animationTemplate.description.scripts.animate.push('bridge.'+id+'.animation');
                    };
                    cycle++;
                } else {
                    createError(new Error(`A component must be created or given a value in "bridge:block_tag_sensor"`))
                };
            });
            return {
                'minecraft:entity': animationTemplate
            }
        }
        onPropose() {
            return {
                [EntityComponent.component_name]: {
                    "$dynamic.list.next_index": {
                        id: "",
                        block_tags: {
                            "$dynamic.list.next_index": ["stone", "metal", "dirt", "sand"]
                        },
                        relative_block_position: {
                            "$dynamic.list.index_triple": "$general.number"
                        },
                        operator: ["==", "!="],
                        type: ["any_tag", "all_tags"],
                        event: "$dynamic.entity.events"
                    }
                }
            };
        };
    }
)