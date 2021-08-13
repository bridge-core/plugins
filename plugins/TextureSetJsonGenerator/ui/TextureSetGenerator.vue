<template>
	<div class="d-flex flex-column">
		<div class="d-flex align-center">
			<v-combobox
				v-model="blockName"
				:items="blockList"
				label="Generate texture set for block"
				clearable
				auto-select-first
				solo
			></v-combobox>
		</div>

		<TextureSetOutput
			v-if="blockName"
			:block="blockName"
			@save="onSave"
			@reset="onReset"
		/>

		<v-snackbar :value="savedFile && savedFile.length">
			{{ savedFile }} saved

			<template v-slot:action="{ attrs }">
				<v-btn
					color="pink"
					text
					v-bind="attrs"
					@click="savedFile = false"
				>
					Close
				</v-btn>
			</template>
		</v-snackbar>
	</div>
</template>

<script>
const { readJSON } = await require('@bridge/fs')
const { createError } = await require('@bridge/notification')
const { getCurrentRP } = await require('@bridge/env')
const { TextureSetOutput } = await require('@bridge/ui')

export default {
	name: 'TextureSetGenerator',
	components: {
		TextureSetOutput,
	},
	data: () => ({
		resetOnSave: false,
		savedFile: false,
		blockName: '',
		blockList: [],
	}),
	mounted() {
		this.updateBlocksList()
	},
	methods: {
		async updateBlocksList() {
			const terrainTextureFile = `${getCurrentRP()}/textures/terrain_texture.json`
			const { texture_data: textureData } = await readJSON(
				terrainTextureFile
			)

			if (!textureData) {
				createError(
					new Error(
						`Could not read textures in ${terrainTextureFile}`
					)
				)
				return
			}

			this.blockList = [
				...new Set(
					Object.keys(textureData)
						.map((k) => {
							const { textures } = textureData[k]
							return textures || ''
						})
						.flat()
						.map((v) => v.substring(v.lastIndexOf('/') + 1))
						.filter((v) => v && `${v}`.length > 0)
				),
			]
		},
		onReset() {
			this.blockName = ''
		},
		onSave(savedFile) {
			this.savedFile = savedFile

			if (this.resetOnSave) {
				this.onReset()
			}
		},
	},
}
</script>
