<template>
	<div class="px-4" v-if="!tab.isReady">
		<h1>Error</h1>
		<p>
			It looks like you didn't setup your com.mojang folder yet. This is
			required in order for this extension to work.
		</p>
	</div>

	<div class="px-4 pb-4" :style="{ 'overflow-y': 'auto' }" v-else>
		<v-row>
			<v-col
				cols="12"
				:sm="12"
				:md="tab.isSharingScreen ? 12 : 6"
				:lg="tab.isSharingScreen ? 6 : 4"
				:xl="tab.isSharingScreen ? 4 : 3"
				v-for="world in tab.availableWorlds"
				:key="world.folderName"
			>
				<v-card>
					<v-img height="225" :src="world.imgSrc" />
					<v-card-title>{{ world.name }}</v-card-title>

					<v-card-actions>
						<v-spacer />
						<v-tooltip color="tooltip" right>
							<template #activator="{ on }">
								<v-btn
									color="primary"
									text
									@click="moveWorld(world.folderName)"
									v-on="on"
								>
									<v-icon small class="pl-1">
										mdi-upload
									</v-icon>
									Test
								</v-btn>
							</template>
							<span>Move world to com.mojang folder</span>
						</v-tooltip>

						<v-tooltip color="tooltip" right>
							<template #activator="{ on }">
								<v-btn
									color="primary"
									text
									@click="fetchWorld(world.folderName)"
									v-on="on"
								>
									<v-icon small class="pl-1">
										mdi-download
									</v-icon>
									Save
								</v-btn>
							</template>
							<span>Move world to project folder</span>
						</v-tooltip>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>

<script>
const { requestFileSystem } = await require('@bridge/com-mojang')
const { copyFolderByHandle, getDirectoryHandle, unlink } =
	await require('@bridge/fs')
const { getCurrentProject } = await require('@bridge/env')
const { createInformationWindow } = await require('@bridge/windows')

export default {
	props: {
		tab: Object,
		height: Number,
	},
	methods: {
		async moveWorld(world) {
			const comMojangFs = await requestFileSystem()

			await comMojangFs.unlink(`minecraftWorlds/${world}`)

			await copyFolderByHandle(
				await getDirectoryHandle(
					`${getCurrentProject()}/worlds/${world}`
				),
				await comMojangFs.getDirectoryHandle(
					`minecraftWorlds/${world}`,
					{ create: true }
				)
			)
		},

		async fetchWorld(world) {
			const comMojangFs = await requestFileSystem()

			if (
				!(await comMojangFs.directoryExists(`minecraftWorlds/${world}`))
			)
				return createInformationWindow(
					'[ERROR]',
					'[Could not find world inside of com.mojang folder!]'
				)

			await unlink(`${getCurrentProject()}/worlds/${world}`)

			await copyFolderByHandle(
				await comMojangFs.getDirectoryHandle(
					`minecraftWorlds/${world}`
				),
				await getDirectoryHandle(
					`${getCurrentProject()}/worlds/${world}`,
					{ create: true }
				)
			)
		},
	},
}
</script>
