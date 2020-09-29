<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Create Task"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="400"
		@closeWindow="onClose"
	>
		<template #default>
			<v-text-field v-model="title" label="Task Name"></v-text-field>
			<v-text-field v-model="assignedTo" label="Assignee"></v-text-field>
			<v-text-field
				v-model="description"
				label="Task Description"
			></v-text-field>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn
				:disabled="!title || !description || !assignedTo"
				color="primary"
				@click="onInputInternal"
				>Create!</v-btn
			>
		</template>
	</BaseWindow>
</template>

<script>
const { BuiltIn } = await require('@bridge/ui')

export default {
	name: 'Information',
	components: {
		BaseWindow: BuiltIn.BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onClose() {
			this.currentWindow.dispose()
		},
		onInputInternal() {
			this.onInput(this.title, this.description, this.assignedTo)
			this.currentWindow.dispose()
		},
	},
}
</script>
