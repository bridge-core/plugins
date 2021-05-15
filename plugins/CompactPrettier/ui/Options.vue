<template>
  <v-container>
			<v-text-field v-model="option.maxLength" label="Max Length"></v-text-field>
			<v-text-field v-model="option.indent" label="Indent"></v-text-field>
			<v-text-field v-model="option.spacing" label="Spacing"></v-text-field>
			<v-spacer />
			<v-btn
				:disabled="isNaN(option.maxLength) || isNaN(option.indent) || (option.spacing.toString() != 'true' && option.spacing.toString() != 'false')"
                :style="{left: '50%', transform:'translate(-50%, 80%)'}"
				color="primary"
				@click="onClick"
				>Save</v-btn
			>
  </v-container>
</template>

<script>
const { readJSON, writeJSON } = await require('@bridge/fs')
let optionsPath = 'extensions/CompactPrettier/options.json';
let rawOptions = {};
export default {
	async mounted() { try { this.option = await readJSON(optionsPath) } catch {} },
	data() { return {option: {}} },
	methods: {
		onClick() {
			rawOptions.maxLength = parseInt(this.option.maxLength);
			rawOptions.indent = parseInt(this.option.indent);
			rawOptions.spacing = this.option.spacing == 'true' ? true : false;
			writeJSON(optionsPath, rawOptions, true)
		}
	},
}
</script>