const { IframeTab, addTab, getCurrentTabSystem } = await require('@bridge/tab')
const { create } = await require('@bridge/sidebar')
const { register, addTabActions, registerPreview } = await require('@bridge/tab-actions')
const { openExternal } = await require('@bridge/utils')
const { registerOpenWithHandler } = await require('@bridge/import')

class MCBEEStructureEditorTab extends IframeTab {
	type = 'MCBEEStructureEditorTab'

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
		return 'mdi-castle'
	}
	get iconColor() {
		return 'primary'
	}
	get name() {
		return 'Structure Editor'
	}
}

async function createTab(tabSystem, fileHandle, filePath) {
	const tab = new MCBEEStructureEditorTab(tabSystem, {
		url: 'https://mcbe-essentials.github.io/structure-editor/',
		openWithPayload: {filePath, fileHandle}
	}) 
	return tab;
}

register({
	icon: 'mdi-open-in-new',
	name: '[Open New]',
	trigger() {
		openExternal('https://mcbe-essentials.github.io/structure-editor/')
	},
	isFor(tab) {
		return tab.type === 'MCBEEStructureEditorTab'
	},
})

registerOpenWithHandler({
	icon: 'mdi-castle',
	name: '[Structure Editor]',
	isAvailable: ({ filePath }) => filePath && filePath.includes("BP/structures"),
	onOpen: async ({ fileHandle, filePath }) => {
		const tab = await createTab(
			await getCurrentTabSystem(),
			fileHandle,
			filePath
		)

		addTab(tab)
	},
})
