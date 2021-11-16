const { ContentTab, openTab } = await require('@bridge/tab')
const { create } = await require('@bridge/sidebar')
const { Tab } = await require('@bridge/ui')
const { getCurrentProject } = await require('@bridge/env')
const { register, addTabActions } = await require('@bridge/tab-actions')
const { openExternal } = await require('@bridge/utils')

class MoLangPlaygroundTab extends ContentTab {
	type = 'MoLangPlaygroundTab'
	component = Tab

	async setup() {
		addTabActions(this)

		await super.setup()
	}

	static is() {
		return false
	}
	async isFor() {
		return false
	}

	get icon() {
		return 'mdi-function-variant'
	}
	get iconColor() {
		return 'primary'
	}
	get name() {
		return 'MoLang Playground'
	}
}

register({
	icon: 'mdi-open-in-new',
	name: '[Open New]',
	trigger(tab) {
		openExternal('https://bridge-core.app/molang-playground/?molang=Q')
	},
	isFor(tab) {
		return tab.type === 'MoLangPlaygroundTab'
	},
})

let currentTabs = {}
create({
	id: 'solvedDev.bridge.moLangPlayground',
	displayName: '[MoLang Playground]',
	icon: 'mdi-function-variant',
	onClick: async () => {
		// Only allow one MoLang Playground to be open at once
		if (currentTabs[getCurrentProject()])
			return currentTabs[getCurrentProject()].select()

		const tab = await openTab(MoLangPlaygroundTab)
		currentTabs[getCurrentProject()] = tab
		tab.onClose.on(() => {
			currentTabs[getCurrentProject()] = undefined
		})
	},
})
