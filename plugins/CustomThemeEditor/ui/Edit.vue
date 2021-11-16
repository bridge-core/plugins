<template>
<BaseWindow
		v-if="shouldRender"
		:windowTitle="windowTitle"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="400"
		v-on:closeWindow="onClose"
	>
		<template #default>
			<div style="text-align:center">
				<v-btn style="position: middle" color="primary" @click="onHelpPage">Help</v-btn>
			</div>
            <v-text-field v-model="result.colors.primary" label="Primary Color" :maxlength=7></v-text-field>
			<input class="previewer" type="color" v-model="result.colors.primary">
			<v-text-field v-model="result.colors.background" label="Background Color" :maxlength=7></v-text-field>
			<input class="previewer" type="color" v-model="result.colors.background">
			<v-text-field v-model="result.colors.accent" label="Icon Color" :maxlength=7></v-text-field>
			<input class="previewer" type="color" v-model="result.colors.accent">
			<v-text-field v-model="result.colors.sidebarNavigation" label="Sidebar Color" :maxlength=7></v-text-field>
			<input class="previewer" type="color" v-model="result.colors.sidebarNavigation">
			<v-text-field v-model="result.colors.expandedSidebar" label="Expanded Sidebar Color" :maxlength=7></v-text-field>
			<input class="previewer" type="color" v-model="result.colors.expandedSidebar">
			<v-text-field v-model="result.colors.toolbar" label="Toolbar Color" :maxlength=7></v-text-field>
			<input class="previewer" type="color" v-model="result.colors.toolbar">
			<v-text-field v-model="result.colors.tooltip" label="Tooltip Background Color" :maxlength=7></v-text-field>
			<input class="previewer" type="color" v-model="result.colors.tooltip">
			<v-text-field v-model="result.colors.menu" label="Toolbar Dropdown Menu Color" :maxlength=7></v-text-field>
			<input class="previewer" type="color" v-model="result.colors.menu">
        </template>
        <template #actions>
            <v-btn 
			color="primary"
            @click="onSaveFile">Save</v-btn>
        </template>
	</BaseWindow>
</template>

<script>
const { join } = await require('@bridge/path')
const { getCurrentProject} = await require("@bridge/env")
const { readJSON, writeJSON, readFile } = await require('@bridge/fs')
const { BuiltIn } = await require('@bridge/ui')
const { createInformationWindow } = await require('@bridge/windows')

let filepath

export default {
	async mounted() {
		try {
			filepath = "extensions/CustomThemeEditor/themes/custom_theme_dark.json"
			this.themefile = await readJSON(filepath)
		} catch {}
		},
		name: 'CustomThemeEditor',
		components: {
			BaseWindow: BuiltIn.BaseWindow,
		},
		props: ['currentWindow'],
		data() {
			return this.currentWindow.getState()
		},
		methods: {
			onHelpPage() {
				createInformationWindow("Help",'First: select "Custom Theme" inside bridge settings - appearance - Dark Theme. Second: Set your colors in the color theme editor either by clicking on the color block and using the color picker or inputting a hexadecimal code and hit save. Third: Press "Reload extensions" in the top toolbar menu under tools. LIGHT MODE is currently not supported yet')
			},
			onClose() {
				this.currentWindow.close()
			},
            onSaveFile() {
				this.themefile.colors.primary = this.result.colors.primary
				this.themefile.colors.background = this.result.colors.background
				this.themefile.colors.accent = this.result.colors.accent
				this.themefile.colors.sidebarNavigation = this.result.colors.sidebarNavigation
				this.themefile.colors.expandedSidebar = this.result.colors.expandedSidebar
				this.themefile.colors.menu = this.result.colors.menu
				this.themefile.colors.toolbar = this.result.colors.toolbar
				this.themefile.colors.tooltip = this.result.colors.tooltip
				writeJSON(filepath,this.themefile,true)
				this.currentWindow.close()
            }
		},
        computed:{
            result: function(){
				return this.themefile
            }
        }
	}
</script>

<style scoped>
input.previewer{
	width: 383px;
	height: 40px;
	text-align: center;
	margin-bottom: 10px;
	font-size: 1rem;
}
</style>