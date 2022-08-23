<template>
	<div class="d-flex align-center pa-2">
		<v-icon class="rounded-lg" x-large color="white"
			>mdi-book</v-icon
		>
		<h1
			class="header ml-2"
			style="
				opacity: 0.7;
				display: block;
				width: calc(100% - 52px);
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			"
		>
			Markdown Docs
		</h1>
	</div>
</template>

<style scoped>
.header {
	font-size: 2.125rem !important;
	font-weight: 400;
	line-height: 2.5rem;
	letter-spacing: 0.0073529412em !important;
}
</style>