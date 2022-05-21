export default defineCommand(({ name, template, schema }) => {
	name('compare')
	schema({
		description: "Executes a command if one score is matches the comparison of the other on an entity.",
		arguments: [
			{ type: "selector" }, //Player or entity
			{
				type: "string",
				additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/function/dynamic/scoreboardObjectiveEnum.json"
				},
			}, //The score to be referenced
			{ type: "string", additionalData: { values: ["==", ">", "<", "<=", ">=", "!="] } }, //The operator
			{
				type: "string",
				additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/function/dynamic/scoreboardObjectiveEnum.json"
				},
			}, //The other score to be referenced
			{ type: "command" } //The command to be run if true
		]
	})

	template((args, { compileCommands, commandNestingDepth, compilerMode }) => {
		var numb;
		var scoreboardID = "bridge_compare_" + (commandNestingDepth + 1);

		if (args[2] == "==") {
			numb = "0";
		} else if (args[2] == ">") {
			numb = "..-1";
		} else if (args[2] == "<") {
			numb = "1..";
		} else if (args[2] == ">=") {
			numb = "..0";
		} else if (args[2] == "<=") {
			numb = "0..";
		} else if (args[2] == "!=") {
			numb = "!0";
		}

		var selector = args[0];
		if (selector.includes("[")) {
			selector.split("[");
			selector[1].replaceAll("]", "");

			if (selector[1].includes("scores")) {
				selector[1].split("{");
				selector[1][1].replaceAll("}", "");
				selector[1][1] += "," + scoreboardID + "=" + numb;
				selector[1].join("");
				selector[1] = "{" + selector[1];
				selector[1] += "}";
			} else {
				selector[1] += ",scores={" + scoreboardID + "=" + numb + "}";
			}

			selector.join("");
			selector = "[" + selector;
			selector += "]";
		} else {
			selector += "[scores={" + scoreboardID + "=" + numb + "}]";
		}

		var command = "";
		for (var i = 0; i < (args.length - 4); i++) {
			command += args[i + 4];
			command += " ";
		}

		var successCommands = compileCommands([command]);
		for (var i = 0; i < successCommands.length; i++) {
			successCommands[i] = ("execute " + selector + " ~ ~ ~ " + successCommands[i]);
		}
		//"execute " + selector + " ~ ~ ~ " + command

		var output = [
			"scoreboard objectives add " + scoreboardID + " dummy",
			"scoreboard players operation @s " + scoreboardID + " = " + args[0] + " " + args[1],
			"scoreboard players operation @s " + scoreboardID + " -= " + args[0] + " " + args[3],
		];
		output = output.concat(successCommands);
		output.push("scoreboard objectives remove " + scoreboardID);

		return output;
	})
})