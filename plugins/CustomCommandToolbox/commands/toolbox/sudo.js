export default defineCommand(({ name, template, schema }) => {
	name('sudo')
	schema({
		description: "Creates a fake chat message as if it was said by someone else visible for everyone.",
		arguments: [
			{ type: "selector" }, //Player or entity
			{ type: "text" }
		]
	})

	template((args) => {
		var selector = args[0].toString();
		args.splice(0, 1);
		var message = args.join(" ");
		var output = [
			`execute ${selector} ~ ~ ~ /tellraw @a { "rawtext" : [ {"text":"<"},{"selector": "@s"},{"text":"> ${message}"} ] }`
		];

		return output;
	})
})