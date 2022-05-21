export default defineCommand(({ name, template, schema }) => {
	name('repeat')
	schema({
		description: "Repeat a command however many times you want. It automatically prints the command out that many times. You can also put \"<&loops>\" anywhere in the command and the amount of times that the command looped will be filled in.",
		arguments: [
			{ type: "number" }, //The amount of times to repeat the command
			{ type: "command" } //The command to repeat
		]
	})

	template((args, { compileCommands, commandNestingDepth, compilerMode }) => {
		var output = [];
		var times = args[0];
		var command = args.slice(1).join(" ");
		for (var i = 0; i < times; i++) {
			var compiledCommands = compileCommands([command.replaceAll("<&loops>", i + 1)]);
			output = output.concat(compiledCommands);
		}
		return output;
	})
})