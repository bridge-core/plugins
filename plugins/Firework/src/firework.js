import * as Backend from './Backend'
import * as Compiler from './Compiler'
import * as ExecutionTree from './ExecutionTree'
import * as Tokenizer from './Tokenizer'

module.exports = ({ fileType, fileSystem, projectRoot, outputFileSystem, options, compileFiles }) => {
	let scripts = {}

	let outAnimations = {}
	
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
                const f = await fileSystem.allFiles(projectRoot + '/BP/firework')

				for(file of f){
					if(file.endsWith('.frw')){
						const filePathArray = file.split('/')

						const fileName = filePathArray[filePathArray.length - 1].substring(0, filePathArray[filePathArray.length - 1].length - 4)

						if(scripts[fileName]){
							console.warn('WARNING: ' + fileName + ' already exists in scripts!')
							continue
						}

						const fO = await fileSystem.readFile(file)
						scripts[fileName] = await fO.text()
					}
				}
            } catch (ex) {}
        },

		async transform(filePath, fileContent) {
			if(noErrors(fileContent) && isEntity(filePath)){
				if(fileContent['minecraft:entity'] && fileContent['minecraft:entity'].components){
					const components = Object.getOwnPropertyNames(fileContent['minecraft:entity'].components)

					let requiredScripts = []

					components.forEach(component => {
						if(component.startsWith('frw:')){
							requiredScripts.push(component.substring(4) + '.frw')
						}
					})

					if(requiredScripts.length > 0){
						for(script of requiredScripts){
							delete fileContent['minecraft:entity'].components['frw:' + script . substring(0, script.length - 4)]
						}

						for(script of requiredScripts){
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

							return compiled.entity
						}
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
				let tick = await outputFileSystem.readJSON(outBPPath + 'functions/tick.json')

				tick.values.push('firework_runtime')

				await outputFileSystem.writeJSON(outBPPath + 'functions/tick.json', JSON.stringify(tick))
			}catch (ex){
				await outputFileSystem.writeFile(outBPPath + 'functions/tick.json', JSON.stringify({
					values: ['firework_runtime']
				}))
			}

            scripts = {}
			outAnimations = {}
        },
	}
}