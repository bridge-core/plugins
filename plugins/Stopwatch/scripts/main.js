const { create } = await require('@bridge/sidebar')
const { Main } = await require('@bridge/ui')

const sidebar = create({
    id: 'pascal.stopwatch.sidebar',
    icon: 'mdi-timer',
    displayName: '[Stopwatch]',
    component: Main,
})
