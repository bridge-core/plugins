const { IframeTab, addTab, getCurrentTabSystem } = await require('@bridge/tab')
const { create } = await require('@bridge/sidebar')
const { register, addTabActions } = await require('@bridge/tab-actions')
const { openExternal } = await require('@bridge/utils')
const commandBar = await require('@bridge/command-bar')

class MolangPlaygroundTab extends IframeTab {
	type = 'MolangPlaygroundTab'

	async setup() {
		addTabActions(this)

		await super.setup()
	}

	static is() {
		return false
	}

	get icon() {
		return 'mdi-function-variant'
	}
	get iconColor() {
		return 'primary'
	}
	get name() {
		return 'Molang Playground'
	}
}

async function createTab() {
	await addTab(
		new MolangPlaygroundTab(await getCurrentTabSystem(), {
			url: 'https://bridge-core.github.io/molang-playground',
		})
	)
}

register({
	icon: 'mdi-open-in-new',
	name: '[Open New]',
	trigger() {
		openExternal(
			'https://bridge-core.github.io/molang-playground/?molang=Q'
		)
	},
	isFor(tab) {
		return tab.type === 'MolangPlaygroundTab'
	},
})

create({
	id: 'solvedDev.bridge.molangPlayground',
	displayName: '[Molang Playground]',
	icon: 'mdi-function-variant',
	onClick: async () => {
		await createTab()
	},
})

commandBar.registerAction({
	icon: 'mdi-function-variant',
	name: '[Open Molang Playground]',
	description: '[Open a Molang Playground tab within bridge.]',
	onTrigger: async () => {
		await createTab()
	},
})
