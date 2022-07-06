const { IframeTab, getCurrentTabSystem, addTab } = await require('@bridge/tab')
const { onFileChanged } = await require('@bridge/project')
const { registerPreview } = await require('@bridge/tab-actions')
const { zlibSync, strFromU8, strToU8 } = await require('@bridge/fflate')
const { registerOpenWithHandler } = await require('@bridge/import')

class SimulateTradeTableTab extends IframeTab {
	type = 'SimulateTradeTableTab'
}

async function createUrl(file) {
	const fileContent = await file.text()
	const url = new URL(
		'https://mcbe-essentials.github.io/trade-table-editor/preview/'
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

async function createTab(tabSystem, fileHandle, filePath) {
	const url = await createUrl(await fileHandle.getFile())

	const tab = new SimulateTradeTableTab(tabSystem, {
		url,
		name: 'Preview: ' + fileHandle.name,
		icon: 'mdi-store-outline',
		iconColor: 'behaviorPack',
	})

	if (filePath)
		onFileChanged(filePath, async (file) => {
			tab.setUrl(await createUrl(file))
		})

	return tab
}

registerPreview({
	name: '[Simulate]',
	fileType: 'tradeTable',
	createPreview: (tabSystem, tab) =>
		createTab(tabSystem, tab.getFileHandle(), tab.getPath()),
})

registerOpenWithHandler({
	icon: 'mdi-store-outline',
	name: '[Trade Table Preview]',
	isAvailable: ({ filePath }) => filePath && filePath.includes('trading'),
	onOpen: async ({ fileHandle, filePath }) => {
		const tab = await createTab(
			await getCurrentTabSystem(),
			fileHandle,
			filePath
		)

		addTab(tab)
	},
})
