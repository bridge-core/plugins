const { ContentTab, openTab } = await require('@bridge/tab')
const { create } = await require('@bridge/sidebar')
const { ToolboxDocs } = await require('@bridge/ui')
const { register, addTabActions } = await require('@bridge/tab-actions')
const { setup } = await require('@bridge/com-mojang')
const {
	readdir,
	getFileHandle,
	loadFileHandleAsDataUrl,
	directoryExists,
	readJSON
} = await require('@bridge/fs')
const { getCurrentProject } = await require('@bridge/env')
const Config = await readJSON(`${getCurrentProject()}/config.json`)

class ToolboxDocsTab extends ContentTab {
	type = 'ToolboxDocsTab'
	component = ToolboxDocs
	availableWorlds = null
	isReady = false
	worldsDir = Config?.ToolboxDocs?.dirPath || 'worlds'

	async setup() {
		await new Promise((resolve) =>
			setup.once(async () => {
				this.isReady = true

				addTabActions(this)
				resolve()
			})
		)

		await super.setup()
	}

	static is() {
		return false
	}
	async isFor() {
		return false
	}

	get icon() {
		return 'mdi-hammer-screwdriver'
	}
	get iconColor() {
		return 'success'
	}
	get name() {
		return 'Toolbox Docs'
	}
}

/*register({
	icon: 'mdi-refresh',
	name: '[Refresh]',
	trigger(tab) {
		tab.refresh()
	},
	isFor(tab) {
		return tab.type === 'ToolboxDocsTab'
	},
})*/

let currentHubs = {};
create({
	id: 'ReBrainerTV.bridge.customCommandDocs',
	displayName: '[Toolbox Docs]',
	icon: 'mdi-hammer-screwdriver',
	onClick: async () => {
		// Only allow one ToolboxDocs to be open at once
		/*if (currentHubs[getCurrentProject()])
			return currentHubs[getCurrentProject()].select()
*/
		const tab = await openTab(ToolboxDocsTab);
		tab.isTemporary = false;
		/*currentHubs[getCurrentProject()] = tab
		tab.onClose.on(() => {
			currentHubs[getCurrentProject()] = undefined
		})*/
	}
})
