const { create, SidebarContent, SelectableSidebarAction } =
	await require('@bridge/sidebar')
const { VanillaPackViewer, Header } = await require('@bridge/ui')
const { addFolderImporter, importHandle } = await require('@bridge/import')
const { createInformationWindow } = await require('@bridge/windows')
const { readFilesFromDir, getFileHandle } = await require('@bridge/fs')
const storage = await require('@bridge/persistent-storage')
const { registerAction } = await require('@bridge/command-bar')
const { openFile } = await require('@bridge/project')

class VanillaPackSidebarContent extends SidebarContent {
	headerSlot = Header
	component = VanillaPackViewer
	actions = []
	directoryEntries = {
		vanillaBehaviorPack: null,
		vanillaResourcePack: null,
	}
	hasHandleAccess = false
	disposables = []

	constructor() {
		super()

		// Add the option to import folder as vanilla pack
		addFolderImporter({
			icon: 'mdi-link-variant',
			name: '[Vanilla Pack]',
			description:
				'[Link a vanilla pack for it to be viewable inside of bridge.]',
			onSelect: async (dirHandle) => {
				await this.handleFolderImport(dirHandle)
			},
		})
		// Load existing handles from idb
		this.loadHandles()
		// Set height of sidebar header UI
		this.headerHeight = '60px'
	}

	async handleFolderImport(dirHandle) {
		// Decide whether it is the vanilla BP or RP by looking at manifest in directory and reading module type
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
				// If type couldn't be decided, show warning
				createInformationWindow(
					'[Vanilla Packs]',
					`[Could not recognise pack as there is no valid manifest in the "${dirHandle.name}" directory.]`
				)
			} else {
				// If it was decided, continue...
				// Load existing idb data
				const data = (await storage.load()) ?? {
					directoryEntries: {
						vanillaBehaviorPack: null,
						vanillaResourcePack: null,
					},
				}
				// Set behavior pack
				if (type === 'behaviorPack') {
					data.directoryEntries.vanillaBehaviorPack = dirHandle
				}
				// OR
				// Set resource pack
				else if (type === 'resourcePack') {
					data.directoryEntries.vanillaResourcePack = dirHandle
				}
				// Save these new file handles to idb and set them on the sidebar state for DirectoryViewer
				await storage.save(data)
				this.directoryEntries = data.directoryEntries
				// Setup viewer
				await this.setup()
			}
		} else {
			// Show warning if imported pack wasn't a directory (e.g. a zip file)
			createInformationWindow(
				'[Vanilla Packs]',
				'[Please try again with a valid vanilla behavior or resource pack folder.]'
			)
		}
	}

	async loadHandles() {
		// Load data from idb
		const data = await storage.load()
		// Set directory entries if they were saved
		if (data?.directoryEntries)
			this.directoryEntries = data.directoryEntries
	}

	async setup() {
		// Get access to handles if necessary
		await this.accessHandles()

		// If we have a BP handle and access to it, add action to VP viewer
		if (
			this.directoryEntries.vanillaBehaviorPack &&
			(await this.directoryEntries.vanillaBehaviorPack.queryPermission()) ===
				'granted'
		)
			this.addPack(
				'behaviorPack',
				this.directoryEntries.vanillaBehaviorPack
			)
		// If we have an RP handle and access to it, add action to VP viewer
		if (
			this.directoryEntries.vanillaResourcePack &&
			(await this.directoryEntries.vanillaResourcePack.queryPermission()) ===
				'granted'
		)
			this.addPack(
				'resourcePack',
				this.directoryEntries.vanillaResourcePack
			)

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

	async accessHandles() {
		// Check if we already have permissions for VP types
		const bpPermission =
			this.directoryEntries.vanillaBehaviorPack &&
			(await this.directoryEntries.vanillaBehaviorPack.queryPermission()) ===
				'granted'
		const rpPermission =
			this.directoryEntries.vanillaResourcePack &&
			(await this.directoryEntries.vanillaResourcePack.queryPermission()) ===
				'granted'

		// If we already have permission for either, update sidebar to show DirectoryViewer and don't continue with requesting permissions
		// Don't need to worry about which pack we specifically have access to because the sidebar action will not be registered if there is no access
		if (bpPermission || rpPermission) {
			this.hasHandleAccess = true
			return
		}

		// For both VBP and VRP, if we don't already have access and the handle has been given to bridge. (either thorugh being dragged on or through idb storage)
		// ...create promises for the permission prompts
		const promises = []
		if (this.directoryEntries.vanillaBehaviorPack && !bpPermission) {
			promises.push(
				this.directoryEntries.vanillaBehaviorPack.requestPermission({
					mode: 'read',
				})
			)
		}

		if (this.directoryEntries.vanillaResourcePack && !rpPermission) {
			promises.push(
				await this.directoryEntries.vanillaResourcePack.requestPermission(
					{
						mode: 'read',
					}
				)
			)
		}
		const res = await Promise.all(promises)
		// If any permission prompt was granted, update sidebar property so that DirectoryViewer is shown
		if (res.some((r) => r === 'granted')) this.hasHandleAccess = true
	}

	hasHandle() {
		// Return whether bridge. has been given either a VBP or VRP handle
		return !!(
			this.directoryEntries.vanillaBehaviorPack ||
			this.directoryEntries.vanillaResourcePack
		)
	}

	async unlink() {
		// Clear idb stored handles and remove handles from sidebar state so they aren't passed to DirectoryViewer
		await storage.delete()
		this.directoryEntries.vanillaResourcePack = null
		this.directoryEntries.vanillaBehaviorPack = null

		// Dispose of all command bar actions
		for (const disposable of this.disposables) disposable.dispose()
	}

	addPack(type, dirHandle, showCannotLinkWarning = false) {
		// Format name to action id, e.g. "behaviorPack" -> "vanillaBehaviorPack"
		const formattedName = `vanilla${type[0].toUpperCase()}${type.substring(
			1
		)}`

		// Check whether the pack already exists in actions, and show warning if necessary
		for (const action of this.actions) {
			if (action.config.id === formattedName) {
				if (showCannotLinkWarning)
					createInformationWindow(
						'[Vanilla Packs]',
						'[Cannot add pack because a pack of this type is already linked to the vanilla pack viewer!]'
					)
				return
			}
		}
		// Push new action for VP to sidebar
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
		this.registerOpenFileActions(dirHandle, type)
	}

	getFileContextMenu(fileWrapper) {
		// Get the custom file context menu to be appended to default, non-mutating context menu
		return [
			{ type: 'divider' },
			{
				icon: 'mdi-import',
				name: '[Import to Project]',
				onTrigger: async () => {
					await importHandle(fileWrapper.handle)
				},
			},
		]
	}

	registerOpenFileActions(dirHandle, type) {
		// Get every file from the pack folder
		readFilesFromDir('', dirHandle).then((data) => {
			// Iterate files
			for (const file of data) {
				this.disposables.push(
					registerAction({
						name: `[${type
							.replace('behaviorPack', 'BP')
							.replace(
								'resourcePack',
								'RP'
							)}/${file.path.substring(1)}]`,
						description: '[Open Vanilla File]',
						icon: 'mdi-minecraft',
						color: type,

						onTrigger: async () => {
							// Get file handle, relative to the dirHandle argument
							const pathArr = file.path.substring(1).split(/\\|\//g)
							const fileName = pathArr.pop()
							let current = dirHandle
							for (const folder of pathArr) {
								current = await current.getDirectoryHandle(folder)
							}
							const fileHandle = await current.getFileHandle(fileName)
							await openFile(fileHandle, { readOnlyMode: 'forced' })
						},
					})
				)
			}
		})
	}
}

// Add the sidebar to the app
create({
	id: 'joelant05.bridge.vpviewer',
	displayName: '[Vanilla Packs]',
	icon: 'mdi-minecraft',
	sidebarContent: new VanillaPackSidebarContent(),
})
