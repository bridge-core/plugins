<template>
    <v-container>
        <div v-if="this.Data.setVersion == null">
            <h1 style="text-align:center;">Minecraft Documentation</h1>
            <h3 block style="text-decoration:underline; text-align:center;">Choose a version</h3>
            <v-btn block color="primary" v-for="item in versions.sort().reverse()" @click="openDocVersion(item)" style="margin-bottom: 10px;"><span>{{ item }}</span></v-btn>
        </div>
        <div v-else>
            <h1 style="text-align:center;">{{ this.Data.setVersion }}</h1>
            <v-btn block color="secondary" @click="goBack" style="margin-bottom: 10px;"><v-icon>mdi-arrow-left-box</v-icon>Back</v-btn>
            <v-btn block color="primary" v-for="item in this.Docs" @click="openDoc(this.Data.setVersion, item)" style="margin-bottom: 10px;"><span>{{ item.name.replace(".html", "") }}</span></v-btn>
        </div>
    </v-container>
</template>

<script>
const { BaseWindow } = await require('@bridge/windows');
const { readdir, readJSON, writeJSON, readFilesFromDir, readFile } = await require('@bridge/fs');
const { IframeTab, addTab, getCurrentTabSystem } = await require('@bridge/tab')

readJSON("./extensions/MinecraftDocumentationImplemention/data.json").then(value => { this.Data = value });
readdir("./extensions/MinecraftDocumentationImplemention/Docs").then(value => { this.versions = value });

export default
{
    async mounted() {
        if(this.Data.setVersion != null)
        {
            readFilesFromDir(`./extensions/MinecraftDocumentationImplemention/Docs/${ this.Data.setVersion }`).then(value => { this.Docs = value });
        }
    },
    data: () => ({
        Docs: [],
		Data
	}),
    methods:
    {
        async openDoc(version, type)
        {
            class DocViewerTab extends IframeTab
            {
                type = "MinecraftDoc";
                static is() {
		            return false
	            }

	            get icon() {
		            return 'mdi-book-open-page-variant'
	            }
	            get iconColor() {
		            return 'primary'
	            }
	            get name() {
		            return `${version}:${type.name.replace(".html","")}`;
	            }
            }
            readFile(`./extensions/MinecraftDocumentationImplemention/Docs/${version}/${type.name}`).then(value => {
                value.text().then(async (res) => {await addTab(new DocViewerTab(await getCurrentTabSystem(), {html:`<html><body style="color:white; font-family: Sans-serif; background-color: #222"><h1 style="color: red;">LINKS INSIDE THIS PAGE DO NOT WORK<h1>${res}</body></html>`}));});
                });
        },
        openDocVersion(version)
        {
            this.Data.setVersion = version;
            writeJSON("./extensions/MinecraftDocumentationImplemention/data.json", this.Data);
            readFilesFromDir(`./extensions/MinecraftDocumentationImplemention/Docs/${ version }`).then(value => { this.Docs = value; console.log(value)});
        },
        goBack()
        {
            this.Data.setVersion = null;
            writeJSON("./extensions/MinecraftDocumentationImplemention/data.json", this.Data);
        }
    }
}
</script>