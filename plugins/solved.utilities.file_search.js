let SEARCH_INPUT = "";
let SEARCH_CATEGORY = "entities";

Bridge.registerPlugin({
    author: "solvedDev",
    version: "1.1.3",
    name: "File Search",
    description: "Quickly search all files of a project for specific keywords."
});

function loadProject(segment, cb) {
    Bridge.FS.readDirectory(segment, (err, files) => {
        if(err) console.warn(err);

        let total = 0;
        let list = [];
      
      	if(!files || files.length == 0) { cb([]); return; }
        files.forEach(file => {
            Bridge.FS.stats(`${segment}/${file}`, (err, stats) => {
                if(err) throw err;
                if(stats.isFile()) {
                    Bridge.FS.readFile(`${segment}/${file}`, (err, data) => {
                        if(err) console.warn(err);
                        
                        list.push({
                            content: data.toString(),
                            file_name: file.toLowerCase(),
                          	file_path: `${Bridge.Utils.base_path}${segment}\\${file}`
                        });
    
                        total++;
                        if(total >= files.length) {
                            if(cb) cb(list);
                        }
                    });
                } else {
                    loadProject(`${segment}/${file}`, (dir) => {
                        if(dir) list.push(...dir);

                        total++;
                        if(total >= files.length) {
                            if(cb) cb(list);
                        }
                    });
                }
            });            
        });
    });
}

function setupUI() {
    Bridge.Window.register({
        id: "solved.utilities.file_search.window",
        options: {
            height: 160,
            is_persistent: false,
            blurs_background: false,
            is_frameless: true
        },
        content: [
            {
                type: "header",
                text: "Information"
            },
            {
                type: "divider"
            },
            {
                text: "\nThis plugin scans all files (name & content) for the search term you enter.\n\n"
            },
            {
                type: "divider"
            },
            {
                text: "created by solvedDev",
                color: "grey"
            }
        ]
    });
    Bridge.Sidebar.register({
        id: "solved.utilities.file_search.sidebar",
        icon: "mdi-magnify",
        title: "File Search",
        toolbar: [
            {
                display_name: "Information",
                display_icon: "mdi-information",
                action() {
                    Bridge.Window.open("solved.utilities.file_search.window");
                }
            }
        ],
        content: [
            {
                type: "select",
                input: SEARCH_CATEGORY,
                options: [
                    "entities",
                    "loot_tables",
                    "functions",
                    "trading"
                ],
                action(val) {
                    SEARCH_CATEGORY = val;
                    if(SEARCH_INPUT != "") loadProject(SEARCH_CATEGORY, updateUI);
                }
            },
            {
                type: "divider"
            },
            {
                type: "input",
                text: "Search...",
                action(val) {
                    SEARCH_INPUT = val;
                    updateUI();
                    loadProject(SEARCH_CATEGORY, updateUI);
                }
            },
            {
                text: "Start typing to search...",
                color: "grey"
            }
        ]
    });
}

function updateUI(list) {
    let content = [
        {
            type: "select",
            input: SEARCH_CATEGORY,
            options: [
                "entities",
                "loot_tables",
                "functions",
                "trading"
            ],
            action(val) {
                SEARCH_CATEGORY = val;
                if(SEARCH_INPUT != "") loadProject(SEARCH_CATEGORY, updateUI);
            }
        },
        {
            type: "divider"
        },
        {
            type: "input",
            text: "Search...",
          	key: Math.random(),
          	input: SEARCH_INPUT,
            action(val) {
                SEARCH_INPUT = val;
                updateUI();
                loadProject(SEARCH_CATEGORY, updateUI);
            }
        }
    ];

    if(!list) {
        content.push({ type: "loader" });
    } else if(SEARCH_INPUT != "") {
      	list.sort((a, b) => {
          if(a.file_name > b.file_name) return 1;
          if(a.file_name < b.file_name) return -1;
          return 0;
        });
        list.forEach(el => {
            if(el.content.includes(SEARCH_INPUT) || el.file_path.toLowerCase().includes(SEARCH_INPUT)) {
                content.push({
                  	text: el.file_name + "\n",
                  	color: "success",
                  	action: () => {
                        console.log(el.file_path)
                		Bridge.openFile(el.file_path);
                	} 
                });
            }
        });
    } else {
        content.push({ text: "Start typing to search...", color: "grey" });
    }
    if(content.length <= 3) {
        content.push({ text: "No results found for \"" }, { text: SEARCH_INPUT, color: "error" }, { text: "\"" });
    }
    
    Bridge.Sidebar.update({
        id: "solved.utilities.file_search.sidebar",
        content
    });
}

setupUI();
