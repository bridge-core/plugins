const fs = await require('@bridge/fs');
const env = await require('@bridge/env');
const { createError } = await require('@bridge/notification');
const currentBPPath = env.getCurrentBP().replace(/\\/g,'/');
const damageByBlockTagPath = `${currentBPPath}/animation_controllers/damageByBlockTag`
const makeDir = ()=>{
    return new Promise((resolve,reject)=>{
        resolve(fs.mkdir(damageByBlockTagPath));
    });
}
const makeFile = (id, filePath)=>{
    return new Promise((resolve,reject)=>{
        resolve(fs.open(filePath, 'wx+'));
    });
};
async function setup_animationController(id,block_tags,relative_block_position,type,operator){
    let filePath = `${damageByBlockTagPath}/${id}.json`
    if(relative_block_position === undefined || !Array.isArray(relative_block_position)){
        relative_block_position = [0,0,0];
    };
    relative_block_position.map((data, i)=>{
        if(!Number.isInteger(data)){
            relative_block_position[i] = 0;
        };
    });
    if(type === undefined){
        type = "any_tag";
    } else if(type === "all_tags" && block_tags.length < 2){
        type = "any_tag";
        createError(new Error(`Component "type" cannot be "all_tags" if the number of tags is less than 2. The value has been changed to "any_tag"`));
    };
    if(operator === undefined){
        operator = "==";
    };
    let tag_count = 0;
    block_tags.map((tag)=>{
        block_tags[tag_count] = "'"+tag+"'";
        tag_count++;
    });
    let makeMoLang = `query.relative_block_has_${type}(${relative_block_position.toString()},${block_tags})${operator}1`
    let makeInverseMoLang = makeMoLang.replace(/1\b/,0)
    let randomState = Math.random();
    try{
        await makeDir();
    } catch(err){};
    try{
        await makeFile(id, filePath);
        let animationController_template ='{\
            "format_version":"1.10.0",\
            "animation_controllers": {\
                "controller.animation.DBBT.'+id+'": {\
                    "initial_state":"default",\
                    "states": {\
                        "default": {\
                            "transitions": [\
                                {"'+randomState+'":"'+makeMoLang+'"}\
                            ]\
                        },\
                        "'+randomState+'": {\
                            "on_entry":[\
                                "@s DBBT:on_'+id+'_add"\
                            ],\
                            "on_exit":[\
                                "@s DBBT:on_'+id+'_remove"\
                            ],\
                            "transitions": [\
                                {"default":"'+makeInverseMoLang+'"}\
                            ]\
                        }\
                    }\
                }\
            }\
        }';
        await fs.writeJSON(filePath, JSON.parse(animationController_template),true);
    } catch(err){
        let fileData = await fs.readJSON(filePath)
        let repeatedMolang = false
        fileData.animation_controllers["controller.animation.DBBT."+id].states.default.transitions.map((data)=>{
            if(makeMoLang === Object.values(data)[0]){
                repeatedMolang = true;
            };
        });
        if(!repeatedMolang){
            fileData.animation_controllers["controller.animation.DBBT."+id].states.default.transitions.push(JSON.parse('{"'+randomState+'":"'+makeMoLang+'"}'));
            fileData.animation_controllers["controller.animation.DBBT."+id].states[randomState] = {
                on_entry: ['@s DBBT:on_'+id+'_add'],
                on_exit: ['@s DBBT:on_'+id+'_remove'],
                transitions: []
            };
            fileData.animation_controllers["controller.animation.DBBT."+id].states[randomState].transitions.push(JSON.parse('{"default":"'+makeInverseMoLang+'"}'));
            fs.writeJSON(filePath, fileData, true)
        }
    };
};
Bridge.register(
    class DBBT {
        static component_name = 'bridge:damage_by_block_tag';
        static type = 'entity';
        onApply(arrayData) {
            let entityTemplate = {
                description: {
                    animations: {},
                    scripts: {
                        animate: []
                    }
                },
                component_groups: {},
                events: {}
            };
            arrayData.map((data,i) => {
                let id = data.id;
                const array_test = [id, data.block_tags, data.time_interval, data.damage_amount];
                let testError = false;
                array_test.map((test_data)=>{
                    if(test_data === undefined){
                        testError = true;
                    };
                });
                if(!testError){
                    let repeatedAnimation = false
                    setup_animationController(id, data.block_tags, data.relative_block_position, data.type, data.operator);
                    entityTemplate.description.animations[`DBBT.${id}.animation`] = `controller.animation.DBBT.${id}`
                    entityTemplate.description.scripts.animate.map((data)=>{
                        if(data === `DBBT.${id}.animation`){
                            repeatedAnimation = true
                        };
                    });
                    if(!repeatedAnimation){
                        entityTemplate.description.scripts.animate.push(`DBBT.${id}.animation`)
                    };
                    let damage_over_time = JSON.parse('{\
                        "minecraft:damage_over_time": {\
                            "damage_per_hurt": '+data.damage_amount+',\
                            "time_between_hurt": '+data.time_interval+'\
                        }\
                    }');
                    entityTemplate.component_groups[`DBBT:${id}`] = damage_over_time;
                    entityTemplate.events[`DBBT:on_${id}_add`] = {
                        add: {
                            component_groups: [`DBBT:${id}`]
                        }
                    };
                    entityTemplate.events[`DBBT:on_${id}_remove`] = {
                        remove: {
                            component_groups: [`DBBT:${id}`]
                        }
                    };
                } else {
                    createError(new Error(`A data or value is required in the object at position ${i}`));
                };
            });
            return {
                'minecraft:entity': entityTemplate
            }
        }
        onPropose() {
            return {
                [DBBT.component_name]: {
                    "$dynamic.list.next_index": {
                        id: "",
                        damage_amount: "$general.number",
                        time_interval: "$general.number",
                        block_tags: {
                            "$dynamic.list.next_index": ""
                        },
                        relative_block_position: {
                            "$dynamic.list.index_triple": "$general.number"
                        },
                        type: ["any_tag", "all_tags"],
                        operator: ["==", "!="]
                    }
                }
            };
        };
    }
);