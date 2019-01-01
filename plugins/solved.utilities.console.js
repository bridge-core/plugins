Bridge.registerPlugin({
    author: "solvedDev",
    version: "1.0.0",
    name: "Console",
    description: "Makes a console available to plugins."
});

class Console {
    constructor() {
        this.content = [];
        this.registered_sidebar = true;
        this.input = "";
        this.context = {
            
        };

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
                action: (val) => {
                    this.input = val;
                },
                enter: () => {
                    this.evalInput();
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
            content: this.content
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
    }

    updateUI() {
        if(this.registered_sidebar) {
            Bridge.Sidebar.update({
                id: "solved.utilities.console.sidebar",
                content: this.getContent()
            });           
        } 
        Bridge.Window.update({
            id: "solved.utilities.console.window",
            content: this.getContent()
        });
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

    log(...args) {
        args.forEach(log => {
            this.__internal__log__(log);
        });
    }
    warn(...args) {
        args.forEach(log => {
            this.__internal__log__(log, "orange");
        });
    }
    error(...args) {
        args.forEach(log => {
            this.__internal__log__(log, "error");
        });
    }

    clear() {
        this.content = [];
        this.updateUI();
    }
}

provide(new Console())
    .as("console");