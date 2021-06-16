<template>
	<div :style="{ height: `${height}px`, overflow: 'auto' }">
		<v-data-table
			:headers="headers"
			:items="table"
			class="elevation-1"
			item-key="Index"
			:expand.sync="expanded"
			show-expand
			:item-class="itemClass"
			:loading="loading"
		>
			<template v-slot:top>
				<v-toolbar flat>
					<v-toolbar-title>T.A.B.L.E.2.</v-toolbar-title>
					<v-divider class="mx-4" inset vertical></v-divider>
					<span>{{ subtitle }}</span>
					<v-spacer></v-spacer>
					<v-dialog v-model="dialog" max-width="500px">
						<template v-slot:activator="{ onn }">
							<v-btn
								v-on="onn"
								color="primary"
								@click="
									initialize().then(() => (loading = false))
								"
							>
								Reset
							</v-btn>
						</template>
						<v-card>
							<v-card-title>
								<span class="text-h5">{{ formTitle }}</span>
							</v-card-title>
							<v-card-text>
								<v-container>
									<v-row>
										<v-textarea
											v-model="editedItem.Usage"
											label="Usage"
										></v-textarea>
									</v-row>
								</v-container>
							</v-card-text>
							<v-card-actions>
								<v-spacer></v-spacer>
								<v-btn
									color="blue darken-1"
									text
									@click="close"
								>
									Cancel
								</v-btn>
								<v-btn color="blue darken-1" text @click="save">
									Save
								</v-btn>
							</v-card-actions>
						</v-card>
					</v-dialog>
				</v-toolbar>
			</template>
			<template v-slot:[`item.actions`]="{ item }">
				<v-icon small class="mr-2" @click="editItem(item)">
					mdi-pencil
				</v-icon>
			</template>
			<template v-slot:[`item.Selected`]="{ item }">
				<v-simple-checkbox
					@click="
						editItem(item)
						item.Selected = !item.Selected
					"
					v-model="item.Selected"
				></v-simple-checkbox>
			</template>
			<template v-slot:expanded-item="{ headers, item }">
				<td v-if="item.Details" :colspan="headers.length">
					{{ item.Details }}
				</td>
			</template>
			<template
				v-slot:[`item.data-table-expand`]="{ item, isExpanded, expand }"
			>
				<v-icon
					@click="expand(true)"
					v-if="item.Details && !isExpanded"
				>
					mdi-chevron-up
				</v-icon>
				<v-icon
					@click="expand(false)"
					v-if="item.Details && isExpanded"
				>
					mdi-chevron-down
				</v-icon>
			</template>
		</v-data-table>
	</div>
</template>

<style>
.selected {
	color: gray;
}
.unselected {
}
</style>

<script>
const { getCurrentBP } = await require('@bridge/env')
const { readJSON } = await require('@bridge/fs')
let configPath = `${getCurrentBP().replace(/\/BP\s*$/, '')}/config.json`
const config = await readJSON(configPath)
export default {
	props: {
		height: Number,
	},
	async beforeMount() {
		this.initialize().then(() => (this.loading = false))
	},
	data: () => {
		return {
			loading: true,
			expanded: [],
			subtitle:
				"Put your sheet.best API key in your project's config.json file with they key 'spreadsheet_api'.",
			dialog: false,
			headers: [
				{ text: 'Selected', value: 'Selected' },
				{
					text: 'Component',
					value: 'Component',
					align: 'start',
					sortable: false,
				},
				{ text: 'Query', value: 'Query' },
				{ text: 'Filter Test', value: 'Filter Test' },
				{ width: '100%', text: 'Usage', value: 'Usage' },
				{ text: 'Actions', value: 'actions', sortable: false },
			],
			table: [],
			editedIndex: -1,
			editedItem: {
				Component: '',
				Query: '',
				'Filter Test': '',
				Usage: null,
				Details: null,
			},
			defaultItem: {
				Component: '',
				Query: '',
				'Filter Test': '',
				Usage: null,
				Details: null,
			},
		}
	},
	computed: {
		formTitle() {
			return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
		},
	},
	watch: {
		dialog(val) {
			val || this.close()
		},
	},
	methods: {
		itemClass(item) {
			return item.Selected ? 'selected' : 'unselected'
		},
		expand(b) {
			return b
		}, // I've wasted an obscene amount of time trying to get rid of this function without breaking everything. I give up.
		editItem(item) {
			this.editedIndex = this.table.indexOf(item)
			this.editedItem = Object.assign({}, item)
			this.dialog = true
		},
		close() {
			this.dialog = false
			this.$nextTick(() => {
				this.editedItem = Object.assign({}, this.defaultItem)
				this.editedIndex = -1
			})
		},
		initialize() {
			if (!config?.spreadsheet_api)
				return new Promise((resolve) => resolve())

			this.loading = true
			this.subtitle = 'Fetching data...'
			return fetch(config.spreadsheet_api)
				.then((r) => r.json())
				.then((d) => {
					for (let i = 0; i < d.length; i++) {
						d[i].Selected = d[i].Selected ? true : false
					}

					this.table = d.map((d, i) => ({ ...d, Index: i }))
					this.subtitle = ''
				})
				.catch((error) => {
					console.error(error)
					this.subtitle =
						'ERROR OCCURED, CONTACT ASSASSIN RIGHT NOW IOSVHIOSGHOIGHOI'
				})
		},
		save() {
			if (this.editedIndex > -1) {
				this.subtitle = 'Pushing data...'
				Object.assign(this.table[this.editedIndex], this.editedItem)
				fetch(
					config.spreadsheet_api + '/' + this.editedIndex.toString(),
					{
						method: 'PATCH',
						mode: 'cors',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(this.table[this.editedIndex]),
					}
				)
					.then((r) => r.json())
					.then(() => (this.subtitle = ''))
					.catch((error) => {
						console.error('Unable to push save', error)
					})
			} else {
				this.table.push(this.editedItem)
			}
			this.Selected = !this.Selected
			this.close()
		},
	},
}
</script>
