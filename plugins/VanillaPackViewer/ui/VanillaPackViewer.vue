<template>
	<v-container
		v-if="
			!sidebarContent.directoryEntries.vanillaBehaviorPack &&
			!sidebarContent.directoryEntries.vanillaResourcePack
		"
	>
		<BridgeSheet
			dark
			class="mb-2 pa-2 d-flex flex-column"
			style="overflow: hidden; text-align: center"
			><v-icon style="font-size: 3rem" color="error" class="mb-4">
				mdi-link-variant-off </v-icon
			>It looks like you don't have a vanilla pack for bridge. to use!
			Download the vanilla BP and RP, then drag them into bridge.'s<br />
			<span style="font-weight: 550; color: var(--v-secondary-base)"
				>data/vanillaPacks/behaviorPack</span
			>
			and<br />
			<span style="font-weight: 550; color: var(--v-secondary-base)"
				>data/vanillaPacks/resourcePack</span
			>
			folders respectively.</BridgeSheet
		>
		<v-btn
			color="secondary"
			class="mb-2 d-flex flex-column"
			style="width: 100%"
			@click="download"
			><span>Download Vanilla Packs</span></v-btn
		>
		<BridgeSheet
			dark
			class="mb-2 pa-2 d-flex flex-column"
			style="overflow: hidden; text-align: center"
			><v-icon style="font-size: 3rem" color="success" class="mb-4">
				mdi-link-variant </v-icon
			>Alternatively, you can temporarily link a vanilla pack by dragging
			it onto bridge.</BridgeSheet
		>
	</v-container>
	<DirectoryViewer
		v-else-if="sidebarContent.selectedAction"
		:key="sidebarContent.selectedAction.config.id"
		:options="{
			isReadOnly: true,
			defaultIconColor: `${sidebarContent.selectedAction.config.id
				.replace('vanilla', '')[0]
				.toLowerCase()}${sidebarContent.selectedAction.config.id
				.replace('vanilla', '')
				.substring(1)}`,
		}"
		:directoryHandle="
			sidebarContent.directoryEntries[
				sidebarContent.selectedAction.config.id
			]
		"
	/>
</template>

<script>
const { BuiltIn } = await require('@bridge/ui')
const { createConfirmWindow } = await require('@bridge/windows')
const { openExternal } = await require('@bridge/utils')

export default {
	components: {
		BridgeSheet: BuiltIn.BridgeSheet,
		DirectoryViewer: BuiltIn.DirectoryViewer,
	},
	props: {
		sidebarContent: Object,
	},
	methods: {
		async download() {
			createConfirmWindow(
				"[This will bring you to a webpage where you can download the vanilla packs for any version. Once downloaded, extract the zip files and drag the BP and RP into bridge.'s 'data/vanillaPacks/behaviorPack' and 'data/vanillaPacks/resourcePack' folders respectively.]",
				'[Download]',
				'[Cancel]',
				() => {
					openExternal('https://bedrock.dev/packs')
				},
				() => {}
			)
		},
	},
}
</script>
