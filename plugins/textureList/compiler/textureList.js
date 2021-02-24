// TODO: Make texture_list work in dev mode

module.exports = ({ resolve, options }) => {
	const textures = new Set()
	const textureList = 'RP/textures/texture_list.json'

	return {
		afterResolveId(filePath) {
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
		load(filePath) {
			if (filePath === textureList) return {}
		},
		finalizeBuild(filePath) {
			if (filePath === textureList) {
				return JSON.stringify([...textures.values()], null, '\t')
			}
		},
		async buildEnd() {
			await resolve(textureList, undefined, true)
		},
	}
}
