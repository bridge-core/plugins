export default ({ fileSystem, projectRoot }) => {

    function getGlobalScripts(fileContent) {
        return fileContent?.include_scripts ?? [];
    }

    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    function containsScripts(fileContent) {
        return fileContent.includes("$eval") && isJson(fileContent);
    }

    function getNextEvalPoint(content) {

        if (typeof content !== 'object')
            return undefined;

        for (let p in content) {

            if (p === '$eval' && Array.isArray(content[p])) {
                let ret = { parent: content, accessor: p, script: { "$eval": content[p] } };
                delete content[p];
                return ret;
            }

            if (Array.isArray(content[p])) {
                if (content[p]?.[0] === '$eval') {
                    content[p].splice(0, 1)
                    let ret = { parent: content, accessor: p, script: content[p] };
                    delete content[p];
                    return ret;
                }
            }

            let rec = getNextEvalPoint(content[p]);
            if (rec)
                return rec;
        }

        return undefined;
    }

    function getStringFromEvalPoint(script) {
        if (!Array.isArray(script))
            return getStringFromEvalPoint(script["$eval"]);

        let concat_script = script.join("\n");
        return concat_script;
    }

    function noErrors(fileContent) {
        return !fileContent?.__error__;
    }

    function cleanup(fileContent) {
        delete fileContent?.include_scripts;
        return fileContent;
    }

    async function readFileString(path) {
        try {
            let f = await fileSystem.readFile(path);
            let data = await f.text();
            return data;
        } catch (error) {
            console.error(error);
        }
       return "";
    }

    async function loadGlobalScript(path) {
        return await readFileString(projectRoot + "/BP/preprocessor_scripts/" + path);
    }

    async function process(_fileContent_) {
        const _globals_ = getGlobalScripts(_fileContent_);

        const _global_scripts_ = [];
        for (let idx in _globals_)
            _global_scripts_.push(await loadGlobalScript(_globals_[idx]));
        const _concat_script_ = _global_scripts_.join(";\n");

        try {
            //Function to contain scope of vars to the file
            await (async () => {

                eval(_concat_script_);

                let _elt_ = getNextEvalPoint(_fileContent_);

                while (_elt_) {
                    const _arr_buf_ = [];
                    //Function to be used in scripts to insert json into the files
                    const json = (ins) => {
                        if (_elt_.accessor === '$eval') {
                            Object.assign(_elt_.parent, ins);
                        }
                        else {
                            if (Array.isArray(_elt_.parent))
                                _arr_buf_.push(ins);
                            else
                                _elt_.parent[_elt_.accessor] = ins;
                        }
                    };
                    const _script_ = getStringFromEvalPoint(_elt_.script);
                    //Function so that each script runs in its own scope
                    try {
                        await (async () => {
                            await eval("(async () => {" + _script_ + "})();");
                            //We insert array values at this point, so that they get inserted at the right place in the array.
                            if (_arr_buf_ && Array.isArray(_elt_.parent))
                                _elt_.parent.splice(_elt_.accessor, 1, ..._arr_buf_);
                        })();
                    } catch (err) {
                        console.error(err)
                        if(_elt_.accessor === '$eval')
                        {
                            Object.assign(_elt_.parent, {"__error__" : err.toString()}); 
                        }
                        else
                        {
                            _elt_.parent[_elt_.accessor] = {"__error__" : err.toString()};
                        }
                    }

                    //get next evaluation point
                    _elt_ = getNextEvalPoint(_fileContent_);
                }

            })();
        } catch (err) {
            console.error(err);
        }
    }

    return {

        //Make sure we load all scripts
        async include() {
            let f = await fileSystem.allFiles(projectRoot + "/BP/preprocessor_scripts");
            return f;
        },

        //Make sure scripts do not get output in the build
        transformPath(filePath) {
            if (filePath.includes("BP/preprocessor_scripts"))
                return null;
        },    
            
        //Make Files depend on their global scripts
        async require(filePath, fileContent) {
            if (noErrors(fileContent)) {
                let globalScripts = getGlobalScripts(fileContent);
                return  Array.from(globalScripts, s => {return projectRoot + `/BP/preprocessor_scripts/${s}`});
            }
        },

        //Read content of file, to test if we want to call transform again
        async read(filePath, fileHandle) {
            const file = await fileHandle.getFile();
            let content = await file.text();

            if (content && containsScripts(content))
                return JSON.parse(content);
        },

        //Actually merge templates with entity files
        async transform(filePath, fileContent) {
            if (containsScripts(JSON.stringify(fileContent)) && noErrors(fileContent)) {
                const start = Date.now();

                await process(fileContent);

                cleanup(fileContent);

                console.log("Processed JS of file: " + filePath + ". Took " + (Date.now() - start) + "ms");
                return fileContent;
            }

            if (fileContent.include_scripts)
                cleanup(fileContent);

            return fileContent;
        },

    }
}