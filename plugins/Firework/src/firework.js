import * as Backend from './Backend'
import * as Compiler from './Compiler'
import * as ExecutionTree from './ExecutionTree'
import * as Tokenizer from './Tokenizer'

//rollup src/firework.js --file compiler/firework.js --format iife

module.exports = ({ fileType, fileSystem, projectRoot, outputFileSystem, options, compileFiles }) => {
	let scripts = {}

	let scriptPaths = {}

	let outAnimations = {}

	let entitiesToCompile = []
	
	function noErrors(fileContent)
    {
        return !fileContent?.__error__;
    }

	function isEntity(filePath){
		const type = fileType?.getId(filePath)

		return type == 'entity'
	}

	return {
		async buildStart() {
            try {
				let newScripts = {}
				let newScriptPaths = {}

                const f = await fileSystem.allFiles(projectRoot + '/BP/firework')

				for(const file of f){
					if(file.endsWith('.frw')){
						const filePathArray = file.split('/')

						const fileName = filePathArray[filePathArray.length - 1].substring(0, filePathArray[filePathArray.length - 1].length - 4)

						if(newScripts[fileName]){
							console.warn('WARNING: ' + fileName + ' already exists in scripts!')
							continue
						}

						const fO = await fileSystem.readFile(file)
						newScripts[fileName] = await fO.text()
						newScriptPaths[fileName] = file

						//console.log('Indexed Script' + fileName + ' to ' + file)
					}
				}

				let entityDepends = {}

				try{
					const entities = await fileSystem.allFiles(projectRoot + '/BP/entities')

					for(const file of entities){
						const fO = await fileSystem.readFile(file)
						const content = JSON.parse(await fO.text())
						
						if(content['minecraft:entity'] && content['minecraft:entity'].components){
							const components = Object.getOwnPropertyNames(content['minecraft:entity'].components)

							let requiredScripts = []

							components.forEach(component => {
								if(component.startsWith('frw:')){
									requiredScripts.push(component.substring(4))
								}
							})

							entityDepends[file] = requiredScripts
						}

						//console.log('Indexed Entity' + file)
					}
				}catch(e){

				}

				//console.log('Generated Entity Depends:')
				//console.log(entityDepends)

				const diffScripts = []

				const indexedScripts = Object.getOwnPropertyNames(newScripts)

				for(const script of indexedScripts){
					if(!scripts[script]){
						diffScripts.push(script)

						continue
					}

					if(scripts[script] != newScripts[script]){
						diffScripts.push(script)

						continue
					}

					if(scriptPaths[script] != newScriptPaths[script]){
						diffScripts.push(script)

						continue
					}
				}

				//console.log('Got Diff Scripts:')
				//console.log(diffScripts)

				const entityDependsKeys = Object.getOwnPropertyNames(entityDepends)

				for(const entity of entityDependsKeys){
					const entityDependsValue = entityDepends[entity]

					for(const script of entityDependsValue){
						if(diffScripts.includes(script)){
							entitiesToCompile.push(entity)

							break
						}
					}
				}

				//console.log('Got Entities to Compile:')
				//console.log(entitiesToCompile)

				scripts = newScripts
				scriptPaths = newScriptPaths
            } catch (ex) {}
        },

		async transform(filePath, fileContent) {			
			if(noErrors(fileContent) && isEntity(filePath)){
				//console.log('Transforming ' + filePath)

				if(fileContent['minecraft:entity'] && fileContent['minecraft:entity'].components){
					const components = Object.getOwnPropertyNames(fileContent['minecraft:entity'].components)

					let requiredScripts = []

					components.forEach(component => {
						if(component.startsWith('frw:')){
							requiredScripts.push(component.substring(4) + '.frw')
						}
					})

					if(requiredScripts.length > 0){
						for(const script of requiredScripts){
							delete fileContent['minecraft:entity'].components['frw:' + script.substring(0, script.length - 4)]
						}

						for(const script of requiredScripts){
							if(scriptPaths[script.substring(0, script.length - 4)]){
								let scriptContent = scripts[script.substring(0, script.length - 4)]

								const tokens = Tokenizer.Tokenize(scriptContent)

								const tree = ExecutionTree.GenerateETree(tokens)

								if(tree instanceof Backend.Error){
									throw tree.message
								}

								const compiled = Compiler.Compile(tree, {
									delayChannels: 3  
								}, fileContent)

								if(compiled instanceof Backend.Error){
									throw compiled.message
								}

								let animations = Object.getOwnPropertyNames(compiled.animations)

								for(let i = 0; i < animations.length; i++){
									outAnimations[animations[i]] = compiled.animations[animations[i]]
								}

								fileContent = compiled.entity
							}else{
								console.warn('WARNING: ' + script + ' does not exist!')
							}
						}

						return fileContent
					}
				}
			}
		},

		async buildEnd() {
			let outBPPath = 'development_behavior_packs/' + projectRoot.split('/')[1] + ' BP/'

			if(options.mode != 'development'){
				outBPPath = projectRoot + '/builds/dist/' + projectRoot.split('/')[1] + ' BP/'
			}

			await outputFileSystem.mkdir(outBPPath + 'animations')

			let animations = Object.getOwnPropertyNames(outAnimations)

			for(let i = 0; i < animations.length; i++){
				await outputFileSystem.writeFile(outBPPath + 'animations/' + animations[i], outAnimations[animations[i]])
			}

			await outputFileSystem.mkdir(outBPPath + 'functions')

			let mc = 'event entity @e[tag=started2, tag=!started3] frw:start\ntag @e[tag=started2] add started3\ntag @e[tag=started] add started2\ntag @e add started'

			await outputFileSystem.writeFile(outBPPath + 'functions/firework_runtime.mcfunction', mc)

			try{
				let tick = await outputFileSystem.readFile(outBPPath + 'functions/tick.json')

				tick = JSON.parse(await tick.text())

				tick.values.push('firework_runtime')

				await outputFileSystem.writeFile(outBPPath + 'functions/tick.json', JSON.stringify(tick))
			}catch (ex){
				//console.log("can't find tick")
				//console.log(ex)

				await outputFileSystem.writeFile(outBPPath + 'functions/tick.json', JSON.stringify({
					values: ['firework_runtime']
				}))
			}

			//console.log('Compiling Extra Entities')
			//console.log(entitiesToCompile)
			await compileFiles(entitiesToCompile)

            //scripts = {}
			outAnimations = {}
			//scriptPaths = {}
			entitiesToCompile = []
        },
	}
}