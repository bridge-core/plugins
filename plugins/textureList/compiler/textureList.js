// TODO: Make texture_list work in dev mode

module.exports = ({ compileFiles, options }) => {
	const textures = new Set()
	const textureList = 'RP/textures/texture_list.json'

	return {
		transformPath(filePath) {
			if (!filePath.startsWith('RP/textures/')) return

			const pathParts = filePath.split('.')
			const ext = pathParts.pop()
			if (
				ext === 'png' ||
				ext === 'tga' ||
				ext === 'jpg' ||
				ext === 'jpeg'
			)
				textures.add(pathParts.join('.').replace('RP/', ''))
		},
		async buildEnd() {
			await compileFiles([textureList], false)
		},
		read(filePath) {
			if (filePath === textureList) return textures
		},
		finalizeBuild(filePath, fileContent) {
			if (filePath === textureList) {
				return JSON.stringify([...fileContent.values()], null, '\t')
			}
		},
	}
}
