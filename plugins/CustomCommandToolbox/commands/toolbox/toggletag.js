export default defineCommand(({ name, template, schema }) => {
	name('toggletag')
	schema({
		description: "When ran, if the selected entity has the tag, it will be removed. If the entity doesn't have the tag, it will be added.",
		arguments: [
			{ type: "selector" }, //The entity to target
			{
				type: "string",
				additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/function/dynamic/entityTagEnum.json"
				}
			} //The tag to toggle
		]
	})

	template((args) => {
		var selector = args[0];
		var tag = args[1];
		var tempselector = selector;

		if (selector.includes("[")) {
			tempselector = selector.split("[");
			tempselector[1] = "bridge_insert_here_yAOdXZDPgn," + tempselector[1];
			tempselector = tempselector.join("[");
		} else {
			tempselector += "[bridge_insert_here_yAOdXZDPgn]";
		}

		var output = [
			("tag " + tempselector + " add bridge_toggle_tag").replaceAll("bridge_insert_here_yAOdXZDPgn", "tag=" + tag),
			("tag " + tempselector + " remove " + tag).replaceAll("bridge_insert_here_yAOdXZDPgn", "tag=bridge_toggle_tag"),
			("tag " + tempselector + " add " + tag).replaceAll("bridge_insert_here_yAOdXZDPgn", "tag=!bridge_toggle_tag"),
			("tag @e remove bridge_toggle_tag"),
		];
		return output;
	})
})