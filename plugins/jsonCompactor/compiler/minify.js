export default ({ }) => {
    return {
        finalizeBuild(filePath, fileContent) {
            if (!filePath.endsWith('.json')) return
            return minify(fileContent)
        }
    }
}



function minify(ob) {
    const obj = ob
    const key = Object.keys(obj).find((x) => x.startsWith("minecraft:"))
    if (!key) return JSON.stringify(obj)
    if (!obj[key].hasOwnProperty("component_groups")) return JSON.stringify(obj)
    return renameComponentGroups(obj[key])
}


function renameComponentGroups(obj) {
    let nameIndex = 0
    let componentGroupKeys = Object.keys(obj?.component_groups)
    if (!obj.hasOwnProperty("events")) return JSON.stringify(obj)
    let map = {}
    Object.keys(obj.events).forEach(_key => {
        const val = obj.events[_key]
        Object.keys(obj.events[_key]).forEach(addRemoveEvent => {
            val[addRemoveEvent].component_groups.forEach((group) => {
                const componentGroupExist = componentGroupKeys.find(x => x == group)
                if (componentGroupExist) {
                    var name = numberToChar(nameIndex)
                    if (map.hasOwnProperty(componentGroupExist)) {
                        name = map[componentGroupExist]
                    } else {
                        name = numberToChar(nameIndex)
                        nameIndex++
                    }

                    obj.component_groups[name] = obj.component_groups[componentGroupExist]
                    obj.events[_key][addRemoveEvent].component_groups[obj.events[_key][addRemoveEvent].component_groups.indexOf(componentGroupExist)] = name
                    map[componentGroupExist] = name
                }
            })
        })
    })
    for(const key of componentGroupKeys){
        delete obj.component_groups[key]
    }
    return JSON.stringify(obj)
}

function numberToChar(num) {
    return String.fromCharCode(num + "a".charCodeAt(0))
}
