Bridge.registerPlugin({
    author: "solvedDev",
    version: "1.1.0",
    name: "Console",
    description: "Makes a console available to plugins."
});

class Console {
    constructor() {
        this.content = [];
        this.registered_sidebar = true;
        this.registered_footer = false;
        this.new_logs = 0;
        this.input = "";
        this.current_open_sidebar = "Explorer";
        this.context = {};

        this.input_logic = [
            {
                type: "icon",
                text: "send",
                action: () => {
                    this.evalInput();
                }
            },
            {
                type: "input",
              	input: this.input,
                action: {
                  	default: (val) => {
                    	this.input = val;
                  	},
                  	enter: () => {
                    	this.evalInput();
                      	this.input = "";
                	}
                }
            }
        ];

        this.setupUI();
    }

    evalInput() {
        try {
            this.__internal__log__("> " + this.input, "grey", false);

            let res = (function(input) { return eval(input); }).call(this.context, this.input);
            this.content.push({ text: "< " });
            this.log(res);
        } catch(e) {
            this.content.push({ text: "< ", color: "error" });
            this.error(e.message);
        }
    }

    getSidebar() {
        return {
            id: "solved.utilities.console.sidebar",
            icon: "sms_failed",
            title: "Console",
            toolbar: [
                {
                    display_icon: "not_interested",
                    display_name: "Clear console",
                    action: () => {
                        this.clear();
                    }
                },
                {
                    display_icon: "open_in_new",
                    display_name: "As separate window",
                    action: () => {
                        this.registered_sidebar = false;
                        this.updateUI();
                        Bridge.Window.open("solved.utilities.console.window");
                        Bridge.Sidebar.remove("solved.utilities.console.sidebar");
                    }
                }
            ],
            content: this.getContent()
        };
    }
    
    setupUI(action_content=this.input_logic) {
        Bridge.Sidebar.register(this.getSidebar());
        Bridge.Window.register({
            id: "solved.utilities.console.window",
            display_name: "Console",
            content: this.content,
            options: {
                is_draggable: true,
                blurs_background: false,
                is_closable: false
            },
            toolbar: [
                {
                    display_icon: "minimize",
                    action: () => {
                        this.registered_sidebar = true;
                        Bridge.Sidebar.register(this.getSidebar());
                        this.updateUI();
                        Bridge.Window.close("solved.utilities.console.window");
                        Bridge.Sidebar.open("solved.utilities.console.sidebar");
                    }
                }
            ],
            actions: action_content
        });
        Bridge.on("opened-sidebar", sidebar_id => {
            this.current_open_sidebar = sidebar_id;
            if(sidebar_id == "solved.utilities.console.sidebar") {
                this.new_logs = 0;
                Bridge.Footer.remove("solved.utilities.console.footer");
            } 
        });
    }

    updateUI() {
        if(this.registered_sidebar) {
            Bridge.Sidebar.update({
                id: "solved.utilities.console.sidebar",
                content: this.getContent()
            }); 
        } else {
            Bridge.Window.update({
                id: "solved.utilities.console.window",
                content: this.getContent(),
                actions: this.input_logic
            });
        }        
    }

    getContent() {
        if(this.registered_sidebar) return this.content.concat([
            {
                type: "horizontal",
                content: this.input_logic
            }
        ]);
        return this.content;
    }

    __internal__log__(data, color, divider=true) {       
        if(typeof data != "string") {
            this.content.push({ text: JSON.stringify(data, null, "  ") + "\n", color });
        } else {
            this.content.push({ text: data + "\n", color });
        }
        
        if(divider) this.content.push({ type: "divider" });
        
        this.updateUI();
    }
    __increase__badge__(new_logs=this.new_logs) {
        if(!this.registered_sidebar|| this.current_open_sidebar == "solved.utilities.console.sidebar") return;

        this.new_logs++;
        if(!this.registered_footer) {
            this.registered_footer = true;
            Bridge.Footer.register({
                id: "solved.utilities.console.footer",
                display_name: `${new_logs+1} new logs`,
                display_icon: "sms_failed",
                badge: {
                    color: "orange",
                    content: new_logs+1
                },
                action: () => {
                    if(this.registered_sidebar) Bridge.Sidebar.open("solved.utilities.console.sidebar")
                }
            });
        } else {
            Bridge.Footer.update({
                id: "solved.utilities.console.footer",
                display_name: `${new_logs+1} new logs`,
                badge: {
                    content: new_logs+1
                }
            });
        }
    }

    log(...args) {
        args.forEach(log => {
            this.__internal__log__(log);
            this.__increase__badge__();
        });
    }
    warn(...args) {
        args.forEach(log => {
            this.__internal__log__(log, "orange");
            this.__increase__badge__();
        });
    }
    error(...args) {
        args.forEach(log => {
            this.__internal__log__(log, "error");
            this.__increase__badge__();
        });
    }
  	info(...args) {
        args.forEach(log => {
            this.__internal__log__(log, "info");
            this.__increase__badge__();
        });
    }
  
  	hook(context) {
    	this.context = context;
    }

    clear() {
        this.content = [];
        this.updateUI();
    }
}

provide(new Console())
    .as("console");