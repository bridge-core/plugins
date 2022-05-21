export default defineCommand(({ name, template, schema }) => {
	name('explode')
	schema({
		description: "Creates an ender crystal-sized explosion at a specific point.",
		arguments: [
			{ type: "coordinate" },
			{ type: "coordinate" },
			{ type: "coordinate" }
		]
	})

	template((args) => {
		var output = [
			"summon ender_crystal " + args.join(" ") + " minecraft:crystal_explode"
		];

		return output;
	})
})
