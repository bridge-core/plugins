// TODO: Make texture_list work in dev mode

module.exports = ({ options }) => {
	const textureList = 'RP/textures/texture_list.json'

	return {
		include() {
			return [textureList]
		},
		require(filePath) {
			if (filePath === textureList)
				return [
					'RP/textures/**/*.png',
					'RP/textures/**/*.tga',
					'RP/textures/**/*.jpg',
					'RP/textures/**/*.jpeg',
				]
		},
		// Reading the textureList file should return the raw textures array
		read(filePath) {
			if (filePath === textureList) return []
		},
		transform(filePath, fileContent, dependencies = {}) {
			if (filePath === textureList)
				return Object.keys(dependencies).map((dep) => {
					const parts = dep.split('.')
					parts.pop() // Removes the file extension
					return parts.join('.')
				})
		},
		// Stringify the textures array to make it ready for writing to disk
		finalizeBuild(filePath, fileContent) {
			if (filePath === textureList)
				return JSON.stringify([...fileContent.values()], null, '\t')
		},
	}
}
