export default ({}) => {
	return {
		finalizeBuild(filePath, fileContent) {
			if (!filePath.endsWith('.json')) return

			const content = JSON.stringify(fileContent)

			// Get strings from file
			const strings = content.match(/\"[^"]*"/g)
			let output = []
			let transformedFile = content

			// RegExpMatchArray to Array
			if (Array.isArray(strings)) {
				strings.forEach((str, i) => {
					// Remove quotes
					str = str.replace(/"/g, '')

					// Convert string
					let convertedStr = ''
					for (const char of str) {
						convertedStr +=
							'\\u' +
							('0000' + char.charCodeAt(0).toString(16)).slice(-4)
					}
					output[i] = convertedStr
					transformedFile = transformedFile.replace(str, output[i])
				})
			}
			return transformedFile
		},
	}
}
