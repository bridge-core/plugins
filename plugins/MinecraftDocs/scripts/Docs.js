const { SideBar } = await require('@bridge/ui')
const { create } = await require('@bridge/sidebar')

create({
	id: 'MinecraftDocumentation',
	displayName: 'Minecraft Documentations',
	icon: 'mdi-file-document-multiple',
	component: SideBar
})
