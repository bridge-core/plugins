module.exports = {
	async beforeTransform(file) {
		if (!file.filePath.endsWith('.json') || file.data !== undefined) return

		const f = await file.fileHandle.getFile()
		file.data = JSON.parse(await f.text())
	},
	afterTransform(file, { minify = false }) {
		file.data = JSON.stringify(f, null, minify ? undefined : '\t')
	},
}
