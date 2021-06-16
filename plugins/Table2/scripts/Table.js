const { ContentTab, openTab } = await require('@bridge/tab')
const { create } = await require('@bridge/sidebar')
const { Table2 } = await require('@bridge/ui')
​
class Table2Tab extends ContentTab {
	type = 'Table2Tab'
	component = Table2
​
	async isFor() {
		return false
	}
	get icon() {
		return 'mdi-google-spreadsheet'
	}
	get iconColor() {
		return 'warning'
	}
	get name() {
		return 'Table2'
	}
}
​
let opened = false
create({
	icon: 'mdi-google-spreadsheet',
	displayName: '[Table2]',
	onClick: async () => {
		if (opened) {
			return console.log('already open')
		}
		const tab = await openTab(Table2Tab)
		opened = true
		tab.onClose.on(() => {
			opened = false
		})
	},
})