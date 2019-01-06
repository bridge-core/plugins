class CommonWindow {
    constructor(other, id="bridge.plugin_window.common_window") {
  		this.id = `${id}.${Math.random()}.${Math.random()}`;
        Bridge.Window.register(Object.assign(other, { id: this.id }));
    }

    update(other) {
        Bridge.Window.update(Object.assign(other, { id: this.id }));
        return this;
    }
    close() {
        Bridge.Window.remove(this.id);
        return this;
    }
    show() {
		Bridge.Window.open(this.id);
      	return this;
    }
  	hide() {
      Bridge.Window.close(this.id);
      return this;
    }
  	
}

provide(CommonWindow)
	.as("bridge.ui.common_window")