const { Edit } = await require('@bridge/ui')
const { create } = await require('@bridge/sidebar')
const { createWindow } = await require('@bridge/windows')

create({
	id: 'sinevector.editor.customtheme',
	displayName: "Custom Theme",
	icon: 'mdi-palette',
	onClick: () => {
		createWindow(Edit,{ windowTitle: 'Custom Theme Editor', themefile: undefined}).open()
	}
})