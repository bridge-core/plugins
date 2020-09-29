const ERROR_WINDOW = "solved.feature.item_plus.error_window";
const LOADING_WINDOW = "solved.feature.item_plus.loading_window.compiling";

Bridge.registerPlugin({
	author: "solvedDev",
	version: "v1.0.0",
	name: "ItemPlus",
	description: "Minecraft's custom items with a few more powerful components."
});

Bridge.Language.addKeywords([ "bridge" ]);

Bridge.AutoCompletions.add("item/components/bridge:player_use_sensor", {
	"slot": "$general.number",
	"keep_after_use": "$general.boolean",
    "has_not_consumed": "$entity.main.minecraft:entity.components",
	"has_consumed": "$entity.main.minecraft:entity.components",
	"on_consume": {
		"$dynamic.list.next_index": {}
	}
});

Bridge.AutoCompletions.add("item/components/bridge:item_equipped_sensor", {
	"slot": "$general.number",
    "is_not_equipped": "$entity.main.minecraft:entity.components",
	"is_equipped": "$entity.main.minecraft:entity.components",
	"loop_events": {
		"$dynamic.list.next_index": {}
	},
	"on_equip": {
		"$dynamic.list.next_index": {}
	},
	"on_unequip": {
		"$dynamic.list.next_index": {}
	}
});

Bridge.Window.register({
    id: ERROR_WINDOW,
    options: {
        is_visible: false,
        is_frameless: true,
        is_persistent: false,
        height: 170
    },
    content: [
        {
            type: "header",
            text: "No \"player.json\" File"
        },
        {
            type: "divider"
        },
        {
            text: "\nPlease download the vanilla behavior pack and place the \"player.json\" entity file inside your BP."
        }
    ]
});
Bridge.Window.register({
    id: LOADING_WINDOW,
    options: {
        is_visible: false,
        is_frameless: true,
        height: 100
    },
    content: [{
            type: "header",
            text: "Loading..."
        },
        {
            type: "divider"
        },
        {
            type: "loader"
        }
    ]
});

Bridge.on("bridge:saveFile", ({ file_path }) => {
	if(!file_path.includes("items") && !file_path.includes("player.json") && !file_path.includes("development_resource_packs")) return;
	readAllItems();
})

async function readAllItems() {
	Bridge.Window.open(LOADING_WINDOW);
	let ANIMATION_LOOPS = { format_version: "1.10.0", animations: {} };
	let PLAYER, CONTROLLER =  { 
		format_version: "1.10.0",
		animation_controllers: { 
			"controller.animation.bridge_item_behavior": {
				states: { 
					default: { transitions: [], on_entry: [ "@s bridge:add_default_player" ], on_exit: [ "@s bridge:remove_default_player" ] } 
				} 
			}
		}
	};

	try {
		//SETUP PLAYER
		PLAYER = await readFile("entities/player.json");
		PLAYER["minecraft:entity"].events["bridge:add_default_player"] = { add: { component_groups: [ "bridge:default_player" ] } };
		PLAYER["minecraft:entity"].events["bridge:remove_default_player"] = { remove: { component_groups: [ "bridge:default_player" ] } };
		let description = PLAYER["minecraft:entity"].description;
		if(description.animations === undefined) description.animations = {};
		if(description.scripts === undefined) description.scripts = {};
		if(description.scripts.animate === undefined) description.scripts.animate = [];

		description.animations.bridge_item_behavior = "controller.animation.bridge_item_behavior";
		if(!description.scripts.animate.includes("bridge_item_behavior"))
			description.scripts.animate.push("bridge_item_behavior");
	} catch(err) {
		Bridge.Window.open(ERROR_WINDOW);
	}
	
	const files = await readDirectory("items");
	let proms = files.map(f => readFile(`items/${f}`).then((item) => processItem(item, PLAYER, CONTROLLER, ANIMATION_LOOPS)).catch(console.error));
	await Promise.all(proms);

	await Promise.all([writeFile("entities/player.json", PLAYER), writeFile("animation_controllers/bridge_item_behavior.json", CONTROLLER), writeFile("animations/bridge_item_behavior_loops.json", ANIMATION_LOOPS)]);
	Bridge.Window.close(LOADING_WINDOW);
}
function processItem(item, PLAYER, CONTROLLER, ANIMATION_LOOPS) {
	let equipped_sensor, use_sensor, item_name = item["minecraft:item"].description.identifier.split(":").pop();
	try { 
		equipped_sensor = item["minecraft:item"].components["bridge:item_equipped_sensor"];
		use_sensor = item["minecraft:item"].components["bridge:player_use_sensor"];
	} catch(e) { return; }
	
	if(equipped_sensor && equipped_sensor.loop_events !== undefined)
		ANIMATION_LOOPS.animations[`animation.bridge_item.${item_name}_loop`] = new Loop(equipped_sensor.loop_events);

	generateController(CONTROLLER, item_name, use_sensor, equipped_sensor);
	generateEntity(PLAYER, item_name, use_sensor, equipped_sensor);
}
function generateController(CONTROLLER, item_name, u_s, e_s) {
	let states = CONTROLLER.animation_controllers["controller.animation.bridge_item_behavior"].states;
	let slot = 0;
	try { slot = e_s.slot || 0; } catch(e) {}
	try { slot = u_s.slot || 0; } catch(e) {}

	if(e_s || u_s) {
		let def = states.default;
		def.transitions.push({ ["equipped_" + item_name]: `query.get_equipped_item_name(${slot}) == '${item_name}'` });
		states["equipped_" + item_name] = {
			transitions: [ { default: `query.get_equipped_item_name(${slot}) != '${item_name}'` } ],
			on_entry: [ `@s bridge:on_equipped_${item_name}`, ...(e_s && e_s.on_equip ? e_s.on_equip : []) ],
			on_exit: [ `@s bridge:on_unequipped_${item_name}`, ...(e_s && e_s.on_unequip ? e_s.on_unequip : []) ]
		}

		//ANIMATION LOOPS
		if(e_s && e_s.loop_events) {
			states["equipped_" + item_name].animations = [ { [`bridge_${item_name}_loop`]: "(1.0)" } ];
		}
	}
	if(u_s) {
		states["equipped_" + item_name].transitions.push({ ["consuming_" + item_name]: "query.is_using_item" });
		states["consuming_" + item_name] = {
			transitions: [
				{ ["consumed_" + item_name]: "query.main_hand_item_max_duration - 1 == query.main_hand_item_use_duration" },
				{ ["equipped_" + item_name]: "!query.is_using_item" },
				{ default: `query.get_equipped_item_name(${slot}) != '${item_name}'` }
			]
		}
		states["consumed_" + item_name] = {
			transitions: [
				{ default: "(1.0)" }
			],
			on_entry: [ `@s bridge:on_consumed_${item_name}`, ...(u_s.on_consume ? u_s.on_consume : []) ]
		}
		if(!u_s.keep_after_use) {
			states["consumed_" + item_name].on_exit = [ `@s bridge:on_remove_consumed_${item_name}` ];
		}
	}
}
function generateEntity(PLAYER, item_name, u_s, e_s) {
	//COMPONENT GROUPS
	let groups = PLAYER["minecraft:entity"].component_groups;
	if(groups === undefined) groups = (PLAYER["minecraft:entity"].component_groups = {});

	let def_group = groups["bridge:default_player"];
	if(def_group === undefined) groups = (groups["bridge:default_player"] = {});

	if(u_s !== undefined) {
		try { Object.assign(def_group, u_s.has_not_consumed) } catch(e) {};
		groups["bridge:consumed_" + item_name] = u_s.has_consumed;
	} 
	if(e_s !== undefined) {
		try { Object.assign(def_group, e_s.is_not_equipped) } catch(e) {};
		groups["bridge:equipped_" + item_name] = e_s.is_equipped;
	}

	//EVENTS
	let events = PLAYER["minecraft:entity"].events;
	if(events === undefined) events = (PLAYER["minecraft:entity"].events = {});
	if(u_s !== undefined) {
		events["bridge:on_consumed_" + item_name] = { add: { component_groups: [ "bridge:consumed_" + item_name ] } };
		events["bridge:on_remove_consumed_" + item_name] = { remove: { component_groups: [ "bridge:consumed_" + item_name ] } };
	}
	if(e_s !== undefined) {
		events["bridge:on_equipped_" + item_name] = { add: { component_groups: [ "bridge:equipped_" + item_name ] } };
		events["bridge:on_unequipped_" + item_name] = { remove: { component_groups: [ "bridge:equipped_" + item_name ] } };
	}
	
	//ANIMATION LOOPS
	if(e_s && e_s.loop_events) {
		let description = PLAYER["minecraft:entity"].description;
		description.animations[`bridge_${item_name}_loop`] = `animation.bridge_item.${item_name}_loop`;
	}
}


class Loop {
	constructor(commands) {
		this.animation_length = 0.05;
		this.loop = true;
		this.timeline = { "0.0": commands };
	}
}

function readFile(path) {
    return new Promise((resolve, reject) => {
        Bridge.FS.readFile(path, (err, data) => {
            if(err) reject(err);
            else resolve(JSON.parse(data.toString()));
        })
    });
}
function readDirectory(path) {
    return new Promise((resolve, reject) => {
        Bridge.FS.readDirectory(path, (err, data) => {
            if(err) reject(err);
            else resolve(data);
        })
    });
}
function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        Bridge.FS.writeFile(path, JSON.stringify(data, null, "\t"), (err) => {
            if(err) reject(err);
            resolve();
        }, false);
    });
}