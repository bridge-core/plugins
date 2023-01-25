<template>
    <div>
        <v-btn color="primary" :loading="sidebarContent.isGenerating" block @click="sidebarContent.compileDocs()">
            Compile Docs
        </v-btn>

        <div class="my-2"></div>

        <DirectoryViewer 
            :renderTopLevelDirectory="true" 
            :directoryHandle="sidebarContent.directoryHandle" 
            :options="{
                isReadOnly: false,
                startPath: sidebarContent.docsPath
            }"
        >
        </DirectoryViewer>
    </div>
</template>

<script>
const { BuiltIn } = await require('@bridge/ui')

export default {
    components: {
        DirectoryViewer: BuiltIn.DirectoryViewer
    },

    props: {
        sidebarContent: Object,
    }
}
</script>