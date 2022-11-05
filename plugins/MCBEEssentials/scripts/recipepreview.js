const { IframeTab, getCurrentTabSystem, addTab } = await require('@bridge/tab')
const { onFileChanged } = await require('@bridge/project')
const { registerPreview } = await require('@bridge/tab-actions')
const { zlibSync, strFromU8, strToU8 } = await require('@bridge/fflate')
const { registerOpenWithHandler } = await require('@bridge/import')

class SimulateRecipeTab extends IframeTab {
	type = 'SimulateRecipeTab'

	async is(tab) {
		const canBeSameTab = await super.is(tab)
		if (!canBeSameTab) return false
	  
		const referencedFile = this.getOptions().openWithPayload?.filePath
		const referencesSameFile = referencedFile === tab.getOptions().openWithPayload?.filePath
	  
		return referencedFile !== undefined && referencesSameFile
	}
}

async function createTab(tabSystem, fileHandle, filePath) {

	const tab = new SimulateRecipeTab(tabSystem, {
		url: 'https://mcbe-essentials.github.io/recipe-previewer/',
		name: 'Preview: ' + fileHandle.name,
		icon: 'mdi-book-outline',
		iconColor: 'behaviorPack',
		openWithPayload: {filePath, fileHandle}
	})

	if (filePath)
		onFileChanged(filePath, async (file) => {
			tab.setUrl(await createUrl(file))
		})

	return tab
}

registerPreview({
	name: '[Simulate]',
	fileType: 'recipe',
	createPreview: (tabSystem, tab) =>
		createTab(tabSystem, tab.getFileHandle(), tab.getPath()),
})

registerOpenWithHandler({
	icon: 'mdi-book-search-outline',
	name: '[Recipe Preview]',
	isAvailable: ({ filePath }) => filePath && filePath.includes('recipes'),
	onOpen: async ({ fileHandle, filePath }) => {
		const tab = await createTab(
			await getCurrentTabSystem(),
			fileHandle,
			filePath
		)

		addTab(tab)
	},
})
