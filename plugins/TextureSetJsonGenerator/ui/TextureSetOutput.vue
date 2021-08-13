<template>
	<div>
		<v-card>
			<v-card-title v-text="filename"></v-card-title>
			<v-card-subtitle v-text="fullPath"></v-card-subtitle>
			<v-divider></v-divider>
			<v-sheet class="pa-5" dark>
				<v-btn rounded right absolute @click="saveTextureSet">
					JSON Output
				</v-btn>

				<pre class="select-all">{{ textureSetJson }}</pre>
			</v-sheet>
			<v-divider></v-divider>
			<v-list-item>
				<v-list-item-content>
					<v-select
						v-model="formatVersion"
						:items="formatVersionMenu"
						label="Format Version"
					></v-select>
				</v-list-item-content>
			</v-list-item>
			<v-divider></v-divider>
			<v-list-item>
				<v-list-item-content>
					<v-combobox
						v-model="displayValue.color"
						label="Base layer"
						:items="[block, ...existingTextures.base]"
						@input="(v) => onLayerInput('color', v)"
					>
						<template v-slot:append-outer>
							<v-btn icon @click.stop="openColorPicker(false)">
								<v-icon color="grey lighten-1"
									>mdi-format-color-fill</v-icon
								>
							</v-btn>
						</template>
					</v-combobox>
				</v-list-item-content>
			</v-list-item>

			<v-list-item>
				<v-list-item-content>
					<v-combobox
						v-model="displayValue.mer"
						label="MER map"
						:items="[...merSuggestions, ...existingTextures.mers]"
						@input="(v) => onLayerInput('mer', v)"
					>
						<template v-slot:append-outer>
							<v-btn icon @click.stop="openColorPicker(true)">
								<v-icon color="grey lighten-1"
									>mdi-format-color-fill</v-icon
								>
							</v-btn>

							<v-btn icon @click="onLayerInput('mer', null)">
								<v-icon color="grey lighten-1"
									>mdi-close</v-icon
								>
							</v-btn>
						</template>
					</v-combobox>
				</v-list-item-content>
			</v-list-item>

			<v-list-item>
				<v-list-item-content>
					<v-combobox
						v-model="
							inputValue[useNormalMap ? 'normal' : 'heightmap']
						"
						label="Depth map"
						:items="[
							...depthMapSuggestions,
							...existingTextures.depth,
						]"
					>
						<template v-slot:append-outer>
							<v-btn
								icon
								@click="
									inputValue[
										useNormalMap ? 'normal' : 'heightmap'
									] = null
								"
							>
								<v-icon color="grey lighten-1"
									>mdi-close</v-icon
								>
							</v-btn>
						</template>
					</v-combobox>
				</v-list-item-content>
				<v-list-item-action>
					<v-menu open-on-hover close-on-click close-on-content-click>
						<template v-slot:activator="{ on, attrs }">
							<v-btn
								small
								color="secondary"
								v-bind="attrs"
								v-on="on"
							>
								{{ !useNormalMap ? 'Heightmap' : 'Normal map' }}
								<v-icon right>mdi-chevron-down</v-icon>
							</v-btn>
						</template>
						<v-list>
							<v-list-item @click="useNormalMap = true">
								<v-list-item-title
									>Normal Map</v-list-item-title
								>
							</v-list-item>
							<v-list-item @click="useNormalMap = false">
								<v-list-item-title>Heightmap</v-list-item-title>
							</v-list-item>
						</v-list>
					</v-menu>
				</v-list-item-action>
			</v-list-item>
			<v-divider></v-divider>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn text @click="$emit('reset')">Reset</v-btn>
				<v-btn text color="primary" @click="saveTextureSet">Save</v-btn>
			</v-card-actions>
		</v-card>

		<v-dialog v-model="showColorPicker" max-width="320">
			<v-card>
				<v-card-title class="headline">Uniform Color</v-card-title>
				<v-card-subtitle>{{
					pickMer ? 'MER' : 'Base'
				}}</v-card-subtitle>
				<v-card-text>
					<v-color-picker @input="colorPickerInput"></v-color-picker>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text color="primary" @click="closeColorPicker"
						>Close</v-btn
					>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
const { writeJSON, readFilesFromDir } = await require('@bridge/fs')
const { createError } = await require('@bridge/notification')
const { getCurrentRP } = await require('@bridge/env')
const ahex = (v) => `${v}`.substr(7, 2) + `${v}`.substr(1, 6)
const getFormatVersions = () => ['1.16.100']

const getExistingTextures = async (endsWithSearch = '_normal') => {
	const existing = await readFilesFromDir(getCurrentRP() + '/textures/blocks')
	const baseNames = existing
		.filter(({ name }) => name.match(/\.(png|tga|gif|jpe?g)$/i))
		.map(({ name }) => name.substr(0, name.indexOf('.')))

	const mers = baseNames.filter((name) => name.endsWith('_mer'))
	const depth = baseNames.filter((name) => name.endsWith(endsWithSearch))
	const base = baseNames.filter(
		(name) => !mers.includes(name) && !depth.includes(name)
	)

	return {
		base,
		mers,
		depth,
	}
}

export default {
	name: 'TextureSetOutput',
	props: {
		block: {
			type: String,
			required: true,
			default: '',
			validator: (v) => `${v}`.match(/^[a-z]+[a-z0-9_]*[a-z0-9]*$/i),
		},
	},
	data: () => ({
		formatVersion: '',
		colorValue: {
			color: null,
			mer: null,
		},
		inputValue: {},
		displayValue: {
			color: null,
			mer: null,
		},
		showColorPicker: false,
		pickMer: false,
		useColorValues: {
			color: false,
			mer: false,
		},
		useNormalMap: true,
		existingTextures: {
			base: [],
			mers: [],
			depth: [],
		},
	}),
	async mounted() {
		this.inputValue = {
			color: `${this.block}`,
			mer: `${this.block}_mer`,
			normal: `${this.block}_normal`,
			heightmap: `${this.block}_heightmap`,
		}
		this.displayValue = this.inputValue
		this.formatVersion = getFormatVersions()[0]

		this.existingTextures = await getExistingTextures(
			this.useNormalMap ? '_normal' : '_heightmap'
		)
	},
	methods: {
		async saveTextureSet() {
			try {
				await writeJSON(this.fullPath, this.textureSetData, true)
				this.$emit('save', this.fullPath)
			} catch (err) {
				createError(err)
			}
		},
		openColorPicker(isMer) {
			this.pickMer = isMer === true
			this.showColorPicker = true
		},
		closeColorPicker() {
			this.pickMer = false
			this.showColorPicker = false
		},
		colorPickerInput({ rgba, hexa, hex }) {
			let rgb = Object.values(rgba)

			if (this.pickMer) {
				this.useColorValues.mer = true
				rgb.length = 3
				this.colorValue.mer = rgb
				this.displayValue.mer = hex
				return
			}

			this.useColorValues.color = true
			this.displayValue.color = '#' + ahex(hexa)
			this.colorValue.color = rgb
		},
		onLayerInput(layer, val) {
			this.useColorValues[layer] = false
			this.inputValue[layer] = val
		},
	},
	computed: {
		filename() {
			return `${this.block.toLowerCase()}.texture_set.json`
		},
		fullPath() {
			const dir = 'blocks' /// TODO: Allow selecting other directories
			return `${getCurrentRP()}/textures/${dir}/${this.filename}`
		},
		textureSetData() {
			const getLayerValue = (layer) => {
				const key = this.useColorValues[layer]
					? 'colorValue'
					: 'inputValue'
				return this[key][layer]
			}

			const textureSet = {
				color: getLayerValue('color') || this.inputValue.color,
			}

			const mer = getLayerValue('mer') || this.inputValue.mer

			if (mer && mer.length > 0) {
				textureSet.metalness_emissive_roughness = mer
			}

			if (this.useNormalMap && this.inputValue.normal) {
				textureSet.normal = `${this.inputValue.normal}`
			}

			if (!this.useNormalMap && this.inputValue.heightmap) {
				textureSet.heightmap = this.inputValue.heightmap
			}

			return {
				format_version: this.formatVersion,
				'minecraft:texture_set': textureSet,
			}
		},
		textureSetJson() {
			return JSON.stringify(this.textureSetData, null, 2)
		},
		merSuggestions() {
			const list = [`${this.block}_mer`]

			if (!this.useColorValues.color) {
				list.push(`${this.inputValue.color}_mer`)
			}

			return list
		},
		depthMapSuggestions() {
			let suffix = 'heightmap'

			const suggestions = []

			if (this.useNormalMap) {
				suffix = 'normal'
				suggestions.push(`${this.block}_n`)
			}

			suggestions.push(`${this.block}_${suffix}`)

			if (
				!this.useColorValues &&
				this.inputValue.color &&
				this.inputValue.color.length > 1
			) {
				suggestions.push(`${this.inputValue.color}_${suffix}`)
			}

			return suggestions
		},
		formatVersionMenu: () => getFormatVersions(),
	},
}
</script>

<style scoped>
@keyframes select {
	to {
		user-select: text;
	}
}

.select-all {
	user-select: all;
}

.select-all:focus {
	animation: select 100ms step-end forwards;
}

.pointer-none {
	pointer-events: none;
}
</style>
