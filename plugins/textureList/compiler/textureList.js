let textureList = []
let createdFile = false

module.exports = {
	async createFiles(file) {
		if (createdFile) return

		createdFile = true
		const listFile = await file.create('RP/textures/texture_list.json')
		listFile.data = textureList
		listFile.hooks.on('cleanup', () => {
			textureList = []
			listFile.data = undefined
		})
	},
	collect(file) {
		const filePath = file.filePath
		if (!filePath.startsWith('RP/textures')) return

		const pathParts = filePath.split('.')
		const ext = pathParts.pop()

		if (ext === 'png' || ext === 'tga' || ext === 'jpg' || ext === 'jpeg')
			textureList.push(pathParts.join('.').replace('RP/', ''))
	},
}
