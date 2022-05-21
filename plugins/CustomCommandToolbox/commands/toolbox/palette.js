export default defineCommand(({ name, template, schema }) => {
	name('palette')
	schema({
		description: "Replaces a slot in the hotbar of a player with an ever-changing palette of items. Run the function every time you want to change blocks. Write block identifiers and data values like \"stonebrick;1\"",
		arguments: [
			{ type: "string" }, //The palette's name
			{ type: "selector" }, //The player to select
			{ type: "number" }, //Hotbar slot
			{
				type: "string", additionalData: {
					values: ["loop", "random"]
				}
			}, //Mode
			//... blocks
		]
	})

	template((args) => {
		var output = [];

		var blocks = args.join("UBJElslddn").split("UBJElslddn");
		blocks.splice(0, 4);
		var name = args[0];
		var selector = args[1];
		var tempselector = selector;
		var slot = args[2];
		var randomMode = (args[3] == "random");

		output.push("scoreboard objectives add bridge.palette." + name + " dummy");
		output.push("scoreboard players add " + selector + " bridge.palette." + name + " 0");
		if (randomMode) {
			output.push("scoreboard players random " + selector + " bridge.palette." + name + " 0 " + blocks.length - 1);
		} else {
			output.push("scoreboard players add " + selector + " bridge.palette." + name + " 1");
			output.push("scoreboard players set @e[scores={bridge.palette." + name + "=" + blocks.length + "}] bridge.palette." + name + " 0");
		}

		if (selector.includes("[")) {
			tempselector = selector.split("[");
			tempselector[1] = "bridge_insert_here_yMOdXZDPgn," + tempselector[1];
			tempselector = tempselector.join("[");
		} else {
			tempselector += "[bridge_insert_here_yMOdXZDPgn]";
		}

		for (var i = 0; i < blocks.length; i++) {
			output.push(("/execute " + tempselector + " ~ ~ ~ /replaceitem entity " + selector + " slot.hotbar " + slot + " " + blocks[i].replaceAll(";", " ")).replaceAll("bridge_insert_here_yMOdXZDPgn", ("scores={bridge.palette." + name + "=" + i + "}")));
		}

		return output;
	})
})