const defaultLanguages = [
	'en_GB',
	'de_DE',
	'es_ES',
	'es_MX',
	'fr_FR',
	'fr_CA',
	'it_IT',
	'ja_JP',
	'ko_KR',
	'pt_BR',
	'pt_PT',
	'ru_RU',
	'zh_CN',
	'zh_TW',
	'nl_NL',
	'bg_BG',
	'cs_CZ',
	'da_DK',
	'el_GR',
	'fi_FI',
	'hu_HU',
	'id_ID',
	'nb_NO',
	'pl_PL',
	'sk_SK',
	'sv_SE',
	'tr_TR',
	'uk_UA',
]

module.exports = ({ options, projectConfig, console }) => {
	let enUsContent = ''
	const enUsPath = projectConfig.resolvePackPath(
		'resourcePack',
		`texts/en_US.lang`
	)

	return {
		include() {
			if (options.mode === 'production')
				return defaultLanguages.map((lang) => [
					projectConfig.resolvePackPath(
						'resourcePack',
						`texts/${lang}.lang`
					),
					{ isVirtual: true },
				])
		},
		read(filePath, fileHandle) {
			if (options.mode !== 'production') return

			if (filePath.endsWith('.lang')) {
				if (!fileHandle) return ''
				return fileHandle.getFile().then((file) => file.text())
			}
		},
		load(filePath, fileContent) {
			if (filePath === enUsPath) {
				enUsContent = fileContent
			}
		},
		finalizeBuild(filePath, fileContent) {
			if (filePath.endsWith('.lang'))
				return fileContent === '' ? enUsContent : fileContent
		},
	}
}
