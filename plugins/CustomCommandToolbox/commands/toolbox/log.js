export default defineCommand(({ name, template, schema }) => {
	name('log')
	schema({
		description: "Puts a message in chat that's only visible if you export the addon in development mode (compiling to com.mojang folder). The bool at the beginning of the command specifies if the message should only be displayed to creative mode players.",
		arguments: [
			{ type: "boolean" }, //Only display message to creative players?
			{ type: "string" } //Message
		]
	})

	template((args, { compileCommands, commandNestingDepth, compilerMode }) => {
		var creativeOnly = args[0];
		var message = args.slice(1).join(" ");
		var output = ((compilerMode == "development") ? [`tellraw @a${(creativeOnly ? "[m=c]" : "")} {"rawtext":[{"text":"${message}"}]}`] : []);
		return output;
	})
})
