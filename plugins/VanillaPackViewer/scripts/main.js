const { create, SidebarContent, SelectableSidebarAction } =
	await require('@bridge/sidebar')
const { VanillaPackViewer, Header } = await require('@bridge/ui')
const { addFolderImporter } = await require('@bridge/import')
const { getDirectoryHandle, onBridgeFolderSetup } = await require('@bridge/fs')
const { createInformationWindow } = await require('@bridge/windows')

class VanillaPackSidebarContent extends SidebarContent {
	headerSlot = Header
	component = VanillaPackViewer
	actions = []
	directoryEntries = {
		vanillaBehaviorPack: null,
		vanillaResourcePack: null,
	}
	isForeignPack = false

	constructor() {
		super()

		onBridgeFolderSetup(async () => {
			await this.setup()
		})
		addFolderImporter({
			icon: 'mdi-link-variant',
			name: '[Vanilla Pack]',
			description:
				'[Link a vanilla pack for it to be viewable inside of bridge.]',
			onSelect: async (dirHandle) =>
				await this.handleFolderImport(dirHandle),
		})
		this.setup()

		this.headerHeight = '60px'
	}

	async handleFolderImport(dirHandle) {
		// Decide whether it is the vanilla BP or RP from manifest
		if (dirHandle.kind === 'directory') {
			let type
			for await (const handle of dirHandle.values()) {
				if (handle.name === 'manifest.json') {
					try {
						const file = await handle.getFile()
						const data = JSON.parse(await file.text())
						if (data.modules) {
							for (const m of data.modules) {
								if (m.type === 'data') {
									type = 'behaviorPack'
									break
								} else if (m.type === 'resources') {
									type = 'resourcePack'
									break
								}
							}
						}
					} catch {}
				}
			}

			if (!type) {
				// Not a valid VP
				console.log(`No VP type found in manifest in ${dirHandle.name}`)
			} else {
				// Is valid
				if (type === 'behaviorPack') {
					this.addPack('behaviorPack', dirHandle)
					this.isForeignPack = true
				}
				if (type === 'resourcePack') {
					this.addPack('resourcePack', dirHandle)
					this.isForeignPack = true
				}
				await this.setup()
			}
		} else {
			createInformationWindow(
				'[Invalid]',
				'[Please try again with a valid vanilla behavior or resource pack folder.]'
			)
		}
	}

	async setup() {
		if (!this.isForeignPack) {
			this.unselectAllActions()
			this.actions = []
			const dirHandle = await getDirectoryHandle('data/vanillaPacks', {
				create: true,
			})
			for await (const handle of dirHandle.values()) {
				if (handle.kind === 'directory') {
					if (
						handle.name === 'behaviorPack' ||
						handle.name === 'resourcePack'
					)
						this.addPack(handle.name, handle)
				}
			}
		}

		// Sort actions, remove resourcePack action and put on end
		if (
			this.actions.length > 0 &&
			this.actions[0].config.id === 'vanillaResourcePack' &&
			this.actions[1]
		) {
			const temp = this.actions[0]
			this.actions[0] = this.actions[1]
			this.actions[1] = temp
		}
	}

	addPack(type, dirHandle) {
		const formattedName = `vanilla${type[0].toUpperCase()}${type.substring(
			1
		)}`
		for (const action of this.actions) {
			if (action.config.id === formattedName) {
				createInformationWindow(
					'[Vanilla Packs]',
					'[Cannot add pack because a pack of this type is already linked to the vanilla pack viewer!]'
				)
				return
			}
		}

		this.actions.push(
			new SelectableSidebarAction(this, {
				id: formattedName,
				name: `[Vanilla ${type
					.replace('behaviorPack', 'BP')
					.replace('resourcePack', 'RP')}]`,
				icon: `mdi-${type === 'behaviorPack' ? 'wrench' : 'image'}`,
				color: type,
			})
		)
		this.directoryEntries[formattedName] = dirHandle
	}
}

create({
	id: 'joelant05.bridge.vpviewer',
	displayName: '[Vanilla Packs]',
	icon: 'mdi-minecraft',
	sidebarContent: new VanillaPackSidebarContent(),
})
