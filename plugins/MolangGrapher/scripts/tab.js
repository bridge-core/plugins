const { IframeTab, addTab, getCurrentTabSystem } = await require('@bridge/tab')
const { create } = await require('@bridge/sidebar')
const { register, addTabActions } = await require('@bridge/tab-actions')
const { openExternal } = await require('@bridge/utils')
const commandBar = await require('@bridge/command-bar')

class MolangGrapherTab extends IframeTab {
	type = 'MolangGrapherTab'

	async setup() {
		addTabActions(this)

		await super.setup()
	}

	static is() {
		return false
	}

	get icon() {
		return 'mdi-sine-wave'
	}
	get iconColor() {
		return 'primary'
	}
	get name() {
		return 'Molang Grapher'
	}
}

async function createTab() {
	await addTab(
		new MolangGrapherTab(await getCurrentTabSystem(), {
			url: 'https://jannisx11.github.io/molang-grapher/',
		})
	)
}

register({
	icon: 'mdi-open-in-new',
	name: '[Open New]',
	trigger() {
		openExternal('https://jannisx11.github.io/molang-grapher/')
	},
	isFor(tab) {
		return tab.type === 'MolangGrapherTab'
	},
})

create({
	id: 'solvedDev.bridge.molangGrapher',
	displayName: '[Molang Grapher]',
	icon: 'mdi-sine-wave',
	onClick: async () => {
		await createTab()
	},
})

commandBar.registerAction({
	icon: 'mdi-sine-wave',
	name: '[Open Molang Grapher]',
	description: '[Open a Molang Grapher tab within bridge.]',
	onTrigger: async () => {
		await createTab()
	},
})
