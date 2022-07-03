const { create } = await require('@bridge/sidebar')
const { Main } = await require('@bridge/ui')

const sidebar = create({
	id: 'solved.simpleTasks.sidebar',
	icon: 'mdi-view-dashboard',
	displayName: '[Tasks]',
	component: Main,
})
