Bridge.registerPlugin({
    author: "solvedDev",
    version: "1.1.5",
    name: "Crash Indicator",
    description: "Displays which entities may cause crashes."
});

let potential_problems = [
    "minecraft:spell_effects",
    "behavior.send_event",
    "behavior.dragon",
    "minecraft:peek"
];

function loadProject(cb) {
    if(Bridge.FS.exists("entities")){
        Bridge.FS.readDirectory("entities", (err, files) => {
            if(err) console.warn(err);
    
            let total = 0;
            let list = [];
            files.forEach(file => {
                Bridge.FS.readFile("entities/" + file, (err, data) => {
                    if(err) console.warn(err);
                    
                    let content = data.toString();
                    potential_problems.forEach(problem => {
                        if(content.includes(problem)) {
                            list.push({
                                type: problem,
                                file: file.toLowerCase(),
                                  content
                            });
                        }
                    });
    
                    total++;
                    if(total >= files.length) {
                        if(cb) cb(list);
                    }
                });
            });
        });
        return "Loading...";   
    }
}

let search = "";

function initialLoad(register=true) {
    loadProject((list) => { 
        let content = [
            {  
                type: "horizontal",
                content: [
                    {  
                        type: "input",
                        text: "Search...",
                        action(val) {
                            search = val;
                            initialLoad(false);
                        }
                    }
                ]
            },
            {
                text: "\n"
            }
        ];
        if(list.length > 0) {
            let el = [];
          	list.sort((a, b) => {
                if(a.type > b.type) return 1;
                if(a.type < b.type) return -1;
                if(a.file > b.file) return 1;
                if(a.file < b.file) return -1;
                return 0;
            });

            for(let e of list.filter(e => e.type.includes(search) || e.file.includes(search))) {
              	let action = () => {
                  	Bridge.openFile(Bridge.Utils.base_path + "entities\\" + e.file);
                };
                el.push({ text: e.type, color: "error" });
                el.push({ text: `\n${e.file}`.replace(/\.json/g, ""), color: "yellow", action });
                el.push({ text: ".json\n", color: "orange", action });
                el.push({ type: "divider" });
            }
            if(el.length == 0) content.push({ text: "No results found for \"" }, { text: search, color: "error" }, { text: "\"" });
            content.push(...el);
          
            content.push({ type: "divider" }, { type: "divider" });
            content.push({ text: "\nTotal: ", color: "success" }, { text: el.length/4 });
        } else {
            content.push({ text: "No potential crashes found!", color: "success" });
        }
        
        
    
        if(register) {
            Bridge.Sidebar.register({
                id: "solved-crash-indicator-sidebar",
                title: "Crash Indicator",
                icon: "mdi-alert-circle",
                toolbar: [
                    {
                        display_icon: "mdi-refresh",
                        action() {
                            initialLoad(false);
                        }
                    }
                ],
                content
            });

            //FOOTER LOGIC
            if(list.length > 0) {
                Bridge.Footer.register({
                    display_name: `${list.length} potential crashes`,
                    display_icon: "mdi-alert-circle",
                    id: "solved-crash-indicator-footer",
                    badge: {
                        color: "error",
                        content: list.length
                    },
        
                    action() {
                        Bridge.Sidebar.open("solved-crash-indicator-sidebar");
                        Bridge.Footer.remove("solved-crash-indicator-footer");
                    }
                });
                Bridge.on("bridge:openedSidebar", (sidebar_id) => {
                    if(sidebar_id == "solved-crash-indicator-sidebar") {
                        Bridge.Footer.remove("solved-crash-indicator-footer");
                    }
                });
            }
        } else {
            Bridge.Sidebar.update({
                id: "solved-crash-indicator-sidebar",
                content
            });
        }
    });
}

initialLoad();
