export default ({ options, fileType, packType, fileSystem, getAliases }) => {

    //Merge function generously "borrowed" by Joel ant 05
    function deepMerge(obj1, obj2) {
        let outArray = undefined
        if (Array.isArray(obj1) && Array.isArray(obj2)) outArray = obj1.concat(obj2)
        else if (Array.isArray(obj1)) outArray = obj1.concat([obj2])
        else if (Array.isArray(obj2)) outArray = obj2.concat([obj1])
        else if (typeof obj2 !== 'object') return obj2

        // Remove duplicates
        if (outArray) return [...new Set([...outArray])]

        let res = {}

        for (const key in obj1) {
            if (obj2[key] === undefined) res[key] = obj1[key]
            else res[key] = deepMerge(obj1[key], obj2[key])
        }

        for (const key in obj2) {
            if (obj1[key] === undefined) res[key] = obj2[key]
        }

        return res
    }

    function isTemplateable(filePath)
    {
        let type = fileType?.getId(filePath);
        switch(type) {
            case  "block" :
            case  "entity" :
            case  "item" :
            case  "particle" :
            case  "clientEntity" :
            case  "clientItem" :  
                return true;
            default:
                return false; 
        }
    }

    function getIdentifier(filePath, fileContent)
    {
        let type = fileType?.getId(filePath);
        switch(type) {
            case  "block" :
                return fileContent?.['minecraft:block']?.description?.identifier;
            case  "entity" :
                return fileContent?.['minecraft:entity']?.description?.identifier
            case  "item" :
            case  "clientItem" :  
                return fileContent?.['minecraft:item']?.description?.identifier
            case  "particle":
                return fileContent?.['particle_effect']?.description?.identifier
            case  "clientEntity" :
                return fileContent?.['minecraft:client_entity']?.description?.identifier
            default:
                return; 
        }
    }

    function isTemplate(filePath, fileContent)
    {
        return fileContent?.is_template && getIdentifier(filePath, fileContent);
    }

    function getInclude(fileContent)
    {
        let inc = fileContent?.include;
        if(inc)
        {
            if(!Array.isArray(inc))
                return [inc];
                return inc;
        }
    }

    function addTemplate(filePath, identifier, fileContent)
    {
        let id = fileType?.getId(filePath);
        let e = templates[id] ?? {};
        e[identifier] = fileContent;
        templates[id] = e;
    }

    function mergeTemplate(filePath, entityJSON, templateEntity)
    {
        let id = fileType?.getId(filePath);
        let templateGroup = templates[id];
        let template = templateGroup?.[templateEntity];
        if(template)
            return deepMerge(template, entityJSON);
        else 
            return entityJSON;
    }

    function cleanup(fileContent)
    {
        delete fileContent?.include;
        delete fileContent?.is_template;
        return fileContent;
    }

    var templates = {};

    return {

        //Make sure template files do not get output in the build
        async transformPath(filePath) {
            if (isTemplateable(filePath)) {

                let obj = await fileSystem.readJson(filePath);
                
                if(isTemplate(filePath, obj))
                return null;
            }
        },
        
        //Same as EntityAliases plugin, do this just in case users don't have it installed
        registerAliases(filePath, fileContent) {
            let type = fileType?.getId(filePath);
            if (
                isTemplateable(filePath) &&
                getIdentifier(filePath, fileContent)
                )
                return [
                    `${getIdentifier(filePath, fileContent)}_${type}`
                ]
            },
            
            //Make entities that use templates depend on those templates
        require(filePath, fileContent) {
                if (isTemplateable(filePath)) {

                let type = fileType?.getId(filePath);
                let includes = getInclude(fileContent);

                if (includes) {
                    return Array.from(includes, i => `${i}_${type}`);
                }
            }
        },

        //Actually merge templates with entity files
        async transform(filePath, fileContent) {
            if (isTemplateable(filePath)) {

                let tobj = fileContent;
                let identifier = getIdentifier(filePath, tobj);
                let isTemplateObj = isTemplate(filePath, tobj);
                let includes = getInclude(tobj);

                if (includes) {
                    for(let i in includes)
                        tobj = await mergeTemplate(filePath, tobj, includes[i]);
                }

                tobj = cleanup(tobj);

                if(isTemplateObj)
                    addTemplate(filePath, identifier, tobj);

                return tobj;
            }
        },

    }
}