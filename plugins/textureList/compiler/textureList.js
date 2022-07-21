export default () => {
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
		// The "transform" hook is used here to compose an array with all textures
		transform(filePath, fileContent, dependencies = {}) {
			if (filePath === textureList) {
				/**
				 * The "dependencies" object always contains the files that were
				 * required earlier. Structure: { [filePath]: fileContent }
				 *  We're only interested in the file paths in this case
				 */
				return Object.keys(dependencies).map((dep) => {
					const parts = dep.split('.')
					parts.pop() // Removes the file extension
					return parts.join('.')
				})
			}
		},
		// Stringify the textures array to make it ready for writing to disk
		finalizeBuild(filePath, fileContent) {
			if (filePath === textureList)
				return JSON.stringify([...fileContent.values()], null, '\t')
		},
	}
}
