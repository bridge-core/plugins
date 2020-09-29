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
					color="sidebar_navigation"
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
const { writeJSON, readJSON } = await require('@bridge/fs')
const { join } = await require('@bridge/path')
const { getCurrentBP } = await require('@bridge/env')
const { createInputWindow, createWindow } = await require('@bridge/windows')
const { InputWindow } = await require('@bridge/ui')

const taskSavePath = join(getCurrentBP(), 'bridge/tasks.json')

export default {
	async mounted() {
		try {
			this.tasks = await readJSON(taskSavePath)
		} catch {}
	},

	data: () => ({
		tasks: [],
	}),

	methods: {
		onCreateTask() {
			createWindow(InputWindow, {
				title: `Task ${this.tasks.length + 1}`,
				description: '',
				assignedTo: '',
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
