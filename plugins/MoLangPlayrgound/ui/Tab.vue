<template>
	<iframe
		ref="playground"
		src="https://bridge-core.app/molang-playground"
		:id="tab.uuid"
		title="MoLang Playground"
		frameborder="0"
		scrolling="no"
		@load="onLoad"
	/>
</template>

<script>
import {
	getColor,
	getHighlighterInfo,
	getCurrentMode,
	onChange,
} from '@bridge/theme'

const colorsToLoad = [
	'background',
	'text',
	'primary',
	'error',
	'expandedSidebar',
]
const highlighters = [
	'keyword',
	'string',
	'number',
	'atom',
	'type',
	'property',
	'definition',
]

let disposable = null
export default {
	props: {
		tab: Object,
		height: Number,
		id: Number,
	},
	data: () => ({
		colors: {},
	}),
	mounted() {
		disposable = onChange((mode) => {
			this.pullColors(mode === 'dark')
		})
	},
	destroyed() {
		if (disposable) disposable.dispose()
		disposable = null
	},
	methods: {
		onLoad() {
			this.pullColors(getCurrentMode())
		},
		pullColors(isDarkMode) {
			const iframe = this.$refs.playground
			if (!iframe) return

			iframe.contentWindow.postMessage(
				{
					type: 'set-dark-mode',
					isDarkMode,
				},
				'https://bridge-core.app/molang-playground'
			)

			colorsToLoad.forEach((color) => {
				iframe.contentWindow.postMessage(
					{
						type: 'set-color',
						colorName: `--v-${color}-base`,
						colorValue: getColor(color),
					},
					'https://bridge-core.app/molang-playground'
				)
			})

			highlighters.forEach((highlighter) => {
				iframe.contentWindow.postMessage(
					{
						type: 'set-highlighter',
						highlighterName: highlighter,
						highlighterData: getHighlighterInfo(highlighter) ?? {},
					},
					'https://bridge-core.app/molang-playground'
				)
			})
		},
	},
}
</script>
