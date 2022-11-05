const { IframeTab, addTab, getCurrentTabSystem } = await require('@bridge/tab')
const { create } = await require('@bridge/sidebar')
const { register, addTabActions } = await require('@bridge/tab-actions')
const { openExternal } = await require('@bridge/utils')
const { registerOpenWithHandler } = await require('@bridge/import')
const commandBar = await require('@bridge/command-bar')


class MCBEEDialogueEditorTab extends IframeTab {
	type = 'MCBEEDialogueEditorTab'

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
		return 'mdi-forum-plus'
	}
	get iconColor() {
		return 'primary'
	}
	get name() {
		return 'Dialogue Editor'
	}
}

async function createTab(tabSystem, fileHandle, filePath) {
	const tab = new MCBEEDialogueEditorTab(tabSystem, {
		url: 'https://mcbe-essentials.github.io/dialogue-editor/',
		openWithPayload: {filePath, fileHandle}
	}) 
	return tab;
}

register({
	icon: 'mdi-open-in-new',
	name: '[Open New]',
	trigger() {
		openExternal('https://mcbe-essentials.github.io/dialogue-editor/')
	},
	isFor(tab) {
		return tab.type === 'MCBEEDialogueEditorTab'
	},
})

registerOpenWithHandler({
	icon: 'mdi-forum-plus',
	name: '[Dialogue Editor]',
	isAvailable: ({ filePath }) => filePath && filePath.includes("BP/dialogue/"),
	onOpen: async ({ fileHandle, filePath }) => {
		const tab = await createTab(
			await getCurrentTabSystem(),
			fileHandle,
			filePath
		)

		addTab(tab)
	},
})
