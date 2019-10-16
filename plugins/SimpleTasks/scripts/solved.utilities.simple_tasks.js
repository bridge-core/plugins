const SIDEBAR = "gm1.utilities.todo_list.sidebar";
const ADD_WINDOW = "gm1.utilities.todo_list.add_todo.window";
let TASKS = [];

let ADD_WINDOW_DATA = {};
Bridge.Window.register({
    id: ADD_WINDOW,
    options: {
        is_visible: false,
        is_frameless: true,
        is_persistent: false,
        height: 250
    },
    content: [
        {
            type: "header",
            text: "New Task"
        },
        {
            type: "divider"
        },
        {
            type: "input",
            text: "Title",
            action: (val) => {
                ADD_WINDOW_DATA.title = val;
            }
        },
        {
            type: "input",
            text: "Description",
            action: (val) => {
                ADD_WINDOW_DATA.description = val;
            }
        }        
    ],
    actions: [
        {
            type: "space"
        },
        {
            type: "button",
            color: "success",
            text: "Create",
            action: () => {
                if(ADD_WINDOW_DATA.description === undefined || ADD_WINDOW_DATA.description === "") return;
                if(ADD_WINDOW_DATA.title === undefined || ADD_WINDOW_DATA.title === "") return;
                TASKS = TASKS.concat([ADD_WINDOW_DATA]);
                renderTasks(TASKS);
                Bridge.Store.save("SIMPLE_TASKS", TASKS);
                Bridge.Window.close(ADD_WINDOW);
                ADD_WINDOW_DATA = {};
            }
        }
    ]
});

Bridge.Sidebar.register({
    id: SIDEBAR,
    title: "Tasks",
    icon: "mdi-view-dashboard",
    toolbar: [
        {
            display_name: "Refresh",
            display_icon: "mdi-refresh",
            action() {
                loadTasks();
            }
        },
        {
            display_name: "Add Task",
            display_icon: "mdi-plus",
            action() {
                Bridge.Window.open(ADD_WINDOW);
            }
        }
    ],
    content: [
        {
            text: "No tasks left... Yay! :)"
        }
    ]
});

Bridge.Store.setup("UTILS");
loadTasks();

function loadTasks() {
    if(Bridge.Store.exists("SIMPLE_TASKS"))
        TASKS = Bridge.Store.load("SIMPLE_TASKS");
    renderTasks(TASKS);
}

function renderTasks(t) {
    let content = [];
    t.sort((a, b) => {
        if((a.is_pinned && b.is_pinned) || (!a.is_pinned && !b.is_pinned)) {
            if(a.is_completed && !b.is_completed) return 1;
            if(b.is_completed && !a.is_completed) return -1;
            return a.title.localeCompare(b.title);
        }
        if(a.is_pinned) return -1;
        if(b.is_pinned) return 1;
        return 0;
    });
    t.forEach((task, index) => content = content.concat(renderTask(task, index)));

    Bridge.Sidebar.update({
        id: SIDEBAR,
        content: content.length > 0 ? content : {
            text: "No tasks left... Yay! :)"
        }
    });
}

function renderTask({ title, description, is_completed,is_pinned }, id) {
    return [
        {
            type: "container",
            content: [
                {
                    type: "icon",
                    text: is_completed ? "mdi-check-circle-outline" : "mdi-checkbox-blank-circle-outline",
                    color: is_completed ? "success" : null,
                    action() {
                        TASKS[id].is_completed = !TASKS[id].is_completed;
                        Bridge.Store.save("SIMPLE_TASKS", TASKS);
                        renderTasks(TASKS);
                    }
                },
                {
                    type: "icon",
                    text: is_pinned ? "mdi-pin" : "mdi-pin-outline",
                    color: is_pinned ? "primary" : null,
                    action() {
                        TASKS[id].is_pinned = !TASKS[id].is_pinned;
                        Bridge.Store.save("SIMPLE_TASKS", TASKS);
                        renderTasks(TASKS);
                    }
                },
                {
                    type: "icon",
                    text: "mdi-delete",
                    action() {
                        TASKS.splice(id, 1);
                        Bridge.Store.save("SIMPLE_TASKS", TASKS);
                        renderTasks(TASKS);
                    }
                }
            ]
            
        },
        {
            type: "header",
            text: title
        },
        {
            type: "container",
            content: [
                {
                    text: description + "\n"
                }
            ]
        },
        {
            type: "divider"
        }
    ]
}