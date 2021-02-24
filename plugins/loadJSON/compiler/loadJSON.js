module.exports = ({}) => {
	return {
		async load(filePath, fileHandle) {
			if (!filePath.endsWith('.json')) return

			const file = await fileHandle.getFile()
			return JSON.parse(await file.text())
		},
		finalizeBuild(filePath, fileContent) {
			if (!filePath.endsWith('.json')) return

			return JSON.stringify(fileContent)
		},
	}
}
