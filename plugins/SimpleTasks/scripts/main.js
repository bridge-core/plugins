const { create } = await require('@bridge/sidebar')
const { Main } = await require('@bridge/ui')
const { writeJSON, readJSON } = await require('@bridge/fs')
const { join } = await require('@bridge/path')
const { getCurrentBP } = await require('@bridge/env')

const sidebar = create({
	icon: 'mdi-view-dashboard',
	displayName: 'Tasks',
	component: Main,
})
