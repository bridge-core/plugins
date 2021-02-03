module.exports = {
	async beforeTransform(file) {
		if (!file.filePath.endsWith('.json') || file.data !== undefined) return

		const f = await file.fileHandle.getFile()
		try {
			file.data = JSON.parse(await f.text())
		} catch {}
	},
	afterTransform(file, { minify = false }) {
		if (
			!file.filePath.endsWith('.json') ||
			typeof file.data !== 'object' ||
			file.data === null
		)
			return

		file.data = JSON.stringify(file.data, null, minify ? undefined : '\t')
	},
}
