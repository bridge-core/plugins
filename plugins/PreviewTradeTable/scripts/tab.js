const { IframeTab } = await require('@bridge/tab')
const { onFileChanged } = await require('@bridge/project')
const { registerPreview } = await require('@bridge/tab-actions')
const { zlibSync, strFromU8, strToU8 } = await require('@bridge/fflate')

class SimulateTradeTableTab extends IframeTab {
	type = 'SimulateTradeTableTab'
}

async function createUrl(file) {
	const fileContent = await file.text()
	const url = new URL(
		'http://127.0.0.1:5500/trade-table-editor/preview/index.html'
	)
	url.searchParams.set(
		'openTradeTable',
		btoa(
			strFromU8(
				zlibSync(strToU8(fileContent), {
					level: 9,
				}),
				true
			)
		)
	)

	return url.href
}

async function createTab(tabsSystem, originTab) {
	const url = await createUrl(await originTab.getFile())

	const tab = new SimulateTradeTableTab(tabsSystem, {
		url,
		name: 'Preview: ' + originTab.name,
		icon: originTab.icon,
		iconColor: originTab.iconColor,
	})

	onFileChanged(originTab.getPath(), async (file) => {
		tab.setUrl(await createUrl(file))
	})

	return tab
}

registerPreview({
	name: '[Simulate]',
	fileType: 'tradeTable',
	createPreview: (tabSystem, tab) => createTab(tabSystem, tab),
})
