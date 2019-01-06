const Common = use("bridge.ui/bridge.ui.common_window.js");

class ConfirmDialog extends Common {
    constructor(on_confirm, on_cancel, other) {
        const ACTIONS = [
            {
                type: "space"
            },
            {
                type: "button",
                text: "Cancel",
                color: "error",
                is_rounded: true,
                action: () => {
                    this.close();
                    if(typeof on_cancel == "function") on_cancel();
                }
            },
            {
                type: "button",
                text: "Confirm",
                color: "primary",
                is_rounded: true,
                action: () => {
                    this.close();
                    if(typeof on_confirm == "function") on_confirm();
                }
            }
        ];

    	super(Object.assign({ actions: ACTIONS, is_visible: true, options: {
          is_frameless: true,
          height: 150
        } },  other), "bridge.plugin_window.confirm_window");
    }  	
}

provide(ConfirmDialog)
    .as("bridge.ui.confirm_window")