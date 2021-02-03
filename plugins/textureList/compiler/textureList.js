const textureList = []
let createdFile = false

module.exports = {
	createFiles(file) {
		if (createdFile) return
		createdFile = true
		file.create('RP/textures/texture_list.json')
		file.data = textureList
		file.hooks.on('cleanup', () => {
			textureList = []
			file.data = undefined
		})
	},
	collect(file) {
		const filePath = file.filePath
		if (!filePath.startsWith('RP/textures')) return

		const pathParts = filePath.split('.')
		const ext = pathParts.pop()
		pathParts.shift()

		if (ext === 'png' || ext === 'tga' || ext === 'jpg' || ext === 'jpeg')
			textureList.push(pathParts.join('/'))
	},
}
