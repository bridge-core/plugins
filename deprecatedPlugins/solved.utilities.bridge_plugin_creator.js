Bridge.registerPlugin({
    author: "solvedDev",
    version: "1.0.1",
    name: "Bridge Plugin Creator",
    description: "Adds bridge. plugin files to bridge.'s native file creation window."
});

Bridge.BuildableFile.register({
    options: {
        extension: "js",
        display_name: "Bridge Plugin",
        path: "bridge/plugins/"
    },
    sidebar_element: {
        title: "Bridge Plugin",
        icon: "mdi-bridge"
    },
    templates: [
        {
            display_name: "Plugin Start",
            content: "// More on plugins: \"https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md\"\n\nBridge.registerPlugin({\n\tauthor: \"\",\n\tversion: \"v1.0.0\",\n\tname: \"\",\n\tdescription: \"\"\n});"
        }
    ]
});