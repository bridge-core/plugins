<template>
	<v-container v-if="!sidebarContent.hasHandleAccess">
		<div v-if="!sidebarContent.hasHandle()">
			<BridgeSheet
				dark
				class="mb-2 pa-2 d-flex flex-column"
				style="overflow: hidden; text-align: center"
				><v-icon style="font-size: 3rem" color="error" class="mb-4">
					mdi-link-variant-off </v-icon
				>It looks like you don't have a vanilla pack linked for bridge.
				to use! Download the vanilla BP and RP and extract them. Then,
				drag the extracted folders onto bridge. to link
				them.</BridgeSheet
			>
			<v-btn
				color="secondary"
				class="mb-2 d-flex flex-column"
				style="width: 100%"
				@click="download"
				><span>Download Vanilla Packs</span></v-btn
			>
		</div>

		<div v-else>
			<BridgeSheet
				dark
				class="mb-2 pa-2 d-flex flex-column"
				style="overflow: hidden; text-align: center"
				><v-icon style="font-size: 3rem" color="success" class="mb-4">
					mdi-link-variant</v-icon
				>
				It looks like you have previously linked vanilla packs to
				bridge.! To continue using these, grant bridge. permissions to
				the folders. Alternatively, unlink the packs and add new
				ones.</BridgeSheet
			>
			<v-btn
				color="secondary"
				class="mb-2 d-flex flex-column"
				style="width: 100%"
				@click="sidebarContent.setup()"
				><v-icon>mdi-folder-open-outline</v-icon
				><span>Access Linked Packs</span></v-btn
			>
			<v-btn
				color="error"
				class="mb-2 d-flex flex-column"
				style="width: 100%"
				@click="sidebarContent.unlink()"
				><v-icon>mdi-link-variant-off</v-icon
				><span>Unlink Packs</span></v-btn
			>
		</div>
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
			provideFileContextMenu: sidebarContent.getFileContextMenu,
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
				"[This will bring you to a webpage where you can download the vanilla packs for any version. Once downloaded, extract the zip files and drag the extracted BP and RP onto bridge. to link them.]",
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
