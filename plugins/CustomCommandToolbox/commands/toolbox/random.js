export default defineCommand(({ name, template, schema }) => {
	name('random')
	schema({
		description: "Executes a command based on random chance. If \"chance\" mode is selected, the command will only be run if the odds are met. If \"result\" mode is selected, the command will always run and you can use \"<&result>\" in your command to reference the result of the random chance.",
		arguments: [
			{ type: "string", additionalData: { values: ["chance", "result"] } },
			{ type: "number" }, //Min chance
			{ type: "number" }, //Max chance
			{ type: "command" } //The command to execute
		]
	})

	template((args, { compileCommands, commandNestingDepth, compilerMode }) => {
		var mode = args[0];
		var randomLowest = args[1];
		var randomHighest = args[2];

		var scoreboardObjective = "bridgeRandom";
		output = [
			"scoreboard objectives add " + scoreboardObjective + " dummy"
		];
		output.push("scoreboard players random @s " + scoreboardObjective + " " + randomLowest + " " + randomHighest);

		var command = args;
		command.splice(0, 3);
		command = command.join(" ");
		if (mode == "chance") {
			var successCommands = compileCommands([command]);
			for (var a = 0; a < successCommands.length; a++) {
				successCommands[a] = (("execute @s[scores={" + scoreboardObjective + "=" + randomLowest + "}] ~ ~ ~ ") + successCommands[a]);
			}
			output = output.concat(successCommands);

		} else if (mode == "result") {
			for (var i = randomLowest - 1; i < randomHighest + 1; i++) {
				var successCommands = compileCommands([command.replaceAll("<&result>", i)]);
				for (var a = 0; a < successCommands.length; a++) {
					successCommands[a] = (("execute @s[scores={" + scoreboardObjective + "=" + i + "}] ~ ~ ~ ") + successCommands[a]);
				}
				output = output.concat(successCommands);
				//output.push(("execute @s[scores={" + scoreboardObjective + "=" + i + "}] ~ ~ ~ " + command)
			}
		}

		output.push("scoreboard objectives remove " + scoreboardObjective);
		return output;
	})
})
