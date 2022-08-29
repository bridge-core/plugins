const { SideBar } = await require("@bridge/ui");
const { create } = await require("@bridge/sidebar");

create({
    id: 'MinecraftDocumentation',
    displayName: 'Minecraft Documentation',
    icon: 'mdi-book-open-page-variant',
    component: SideBar
})