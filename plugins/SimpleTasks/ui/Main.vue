<template>
	<div>
		<v-container>
			<v-btn color="primary" block @click="onCreateTask">
				<v-icon>mdi-plus</v-icon>
				<span>Create!</span>
			</v-btn>
		</v-container>

		<v-divider />

		<v-container style="height: calc(100% - 60px); overflow-y: auto">
			<transition-group name="task-list" tag="div">
				<v-card
					v-for="(task, i) in tasks"
					:key="
						task.description +
						task.title +
						i +
						task.isPinned +
						task.isDone +
						task.assignedTo
					"
					class="task-list-item"
					style="margin-bottom: 0.8rem"
					color="sidebarSelection"
				>
					<v-card-title>
						<v-btn
							icon
							:color="task.isDone ? 'success' : null"
							@click="toggleIsDone(i)"
						>
							<v-icon>
								{{
									task.isDone
										? 'mdi-check-circle-outline'
										: 'mdi-checkbox-blank-circle-outline'
								}}
							</v-icon>
						</v-btn>
						<span>{{ task.title }}</span>
					</v-card-title>
					<v-card-text>
						Assignee:
						<span class="text--primary">{{ task.assignedTo }}</span>
						<br />
						{{ task.description }}
					</v-card-text>
					<v-card-actions>
						<v-btn
							icon
							:color="task.isPinned ? 'primary' : null"
							@click="toggleIsPinned(i)"
						>
							<v-icon>
								{{
									task.isPinned
										? 'mdi-pin'
										: 'mdi-pin-outline'
								}}
							</v-icon>
						</v-btn>

						<v-spacer />

						<v-btn icon color="error" @click="deleteTask(i)">
							<v-icon> mdi-delete </v-icon>
						</v-btn>
					</v-card-actions>
				</v-card>
			</transition-group>
		</v-container>
	</div>
</template>

<script>
const { readJSON, writeJSON } = await require('@bridge/fs')
const { join } = await require('@bridge/path')
const { getCurrentProject, getCurrentBP, getProjectAuthors, APP_VERSION } =
	await require('@bridge/env')
const { onProjectChanged } = await require('@bridge/project')
const { createWindow } = await require('@bridge/windows')
const { InputWindow } = await require('@bridge/ui')
const { compare } = await require('@bridge/compare-versions')

const isV2 = compare(APP_VERSION, '2.0.0', '>=')

let taskSavePath
const loadTaskSavePath = () => {
	if (isV2) taskSavePath = join(getCurrentProject(), '.bridge/tasks.json')
	else taskSavePath = join(getCurrentBP(), 'bridge/tasks.json')
}
loadTaskSavePath()

export default {
	async mounted() {
		// Test that the API is already available
		if (onProjectChanged) {
			this.disposable = onProjectChanged(async () => {
				loadTaskSavePath()
				await this.loadTasks()
			})
		}

		await this.loadTasks()
	},
	destroyed() {
		if (this.disposable) this.disposable.dispose()
	},

	data: () => ({
		tasks: [],
		disposable: null,
	}),

	methods: {
		async loadTasks() {
			try {
				this.tasks = await readJSON(taskSavePath)
			} catch {
				this.tasks = []
			}
		},
		async onCreateTask() {
			const authors = isV2 ? await getProjectAuthors() : undefined
			let author = ''
			if (authors) {
				author =
					typeof authors[0] === 'string'
						? authors[0]
						: authors[0].name
			}

			createWindow(InputWindow, {
				title: `Task ${this.tasks.length + 1}`,
				description: '',
				assignedTo: author || '',
				onInput: (title, description, assignedTo) => {
					this.tasks.push({
						title,
						description,
						assignedTo,
						isDone: false,
						isPinned: false,
					})
					this.sortTasks()
				},
			}).open()
		},
		toggleIsDone(i) {
			this.tasks[i].isDone = !this.tasks[i].isDone
			this.sortTasks()
		},
		toggleIsPinned(i) {
			this.tasks[i].isPinned = !this.tasks[i].isPinned
			this.sortTasks()
		},
		deleteTask(i) {
			this.tasks.splice(i, 1)
			this.sortTasks()
		},
		sortTasks() {
			this.tasks = this.tasks.sort((taskA, taskB) => {
				const aScore = taskA.isPinned * -2 + taskA.isDone
				const bScore = taskB.isPinned * -2 + taskB.isDone

				return aScore - bScore
			})
			this.saveTasks()
		},
		saveTasks() {
			writeJSON(taskSavePath, this.tasks, true)
		},
	},
}
</script>

<style scoped>
.task-list-item {
	transition: all 0.1s;
}
.task-list-enter,
.task-list-leave-to {
	opacity: 0;
	transform: translateY(30px);
}
.task-list-leave-active {
	position: absolute;
}
</style>
