const folders = {
	BP: 'development_behavior_packs',
	RP: 'development_resource_packs',
	SP: 'development_skin_packs',
}

module.exports = {
	transformPath(file, opts) {
		if (!opts.buildName) opts.buildName = 'dev'
		if (!opts.packName) opts.packName = 'bridge'

		const pathParts = file.filePath.split('/')
		const pack = pathParts.shift()

		if (folders[pack])
			file.filePath = `builds/${opts.buildName}/${folders[pack]}/${
				opts.packName
			}/${pathParts.join('/')}`
	},
}
