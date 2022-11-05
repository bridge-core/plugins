const { IframeTab, addTab, getCurrentTabSystem } = await require('@bridge/tab')
const { create } = await require('@bridge/sidebar')
const { register, addTabActions, registerPreview } = await require('@bridge/tab-actions')
const { openExternal } = await require('@bridge/utils')
const { registerOpenWithHandler } = await require('@bridge/import')

class MCBEETradeTableEditorTab extends IframeTab {
	type = 'MCBEETradeTableEditorTab'

	async setup() {
		addTabActions(this)

		await super.setup()
	}

	async is(tab) {
		const canBeSameTab = await super.is(tab)
		if (!canBeSameTab) return false
	  
		const referencedFile = this.getOptions().openWithPayload?.filePath
		const referencesSameFile = referencedFile === tab.getOptions().openWithPayload?.filePath
	  
		return referencedFile !== undefined && referencesSameFile
	}

	get icon() {
		return 'mdi-store-edit-outline'
	}
	get iconColor() {
		return 'primary'
	}
	get name() {
		return 'Trade Table Editor'
	}
}

async function createTab(tabSystem, fileHandle, filePath) {
	const tab = new MCBEETradeTableEditorTab(tabSystem, {
		url: 'https://mcbe-essentials.github.io/trade-table-editor/',
		openWithPayload: {filePath, fileHandle}
	}) 
	return tab;
}

register({
	icon: 'mdi-open-in-new',
	name: '[Open New]',
	trigger() {
		openExternal('https://mcbe-essentials.github.io/trade-table-editor/')
	},
	isFor(tab) {
		return tab.type === 'MCBEETradeTableEditorTab'
	},
})

registerOpenWithHandler({
	icon: 'mdi-store-edit-outline',
	name: '[Trade Table Editor]',
	isAvailable: ({ filePath }) => filePath && filePath.includes("BP/trading"),
	onOpen: async ({ fileHandle, filePath }) => {
		const tab = await createTab(
			await getCurrentTabSystem(),
			fileHandle,
			filePath
		)

		addTab(tab)
	},
})
