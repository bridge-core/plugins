export default defineCommand(({ name, template, schema }) => {
	name('mobwave')
	schema({
		description: "Spreads a wave of entities around a certain point.",
		arguments: [
			{ type: "string", additionalData: { schemaReference: "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/entity_identifiers" } }, //Mob
			{ type: "number" }, //Amount
			{ type: "coordinate" }, //X
			{ type: "coordinate" }, //Y
			{ type: "coordinate" }, //Z
			{ type: "number" }, //Spread distance
			{
				type: "string", additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/entity/dynamic/eventReference.json"
				}
			} //Event Name
		]
	})

	template((args) => {
		var output = [];

		var mob = args[0];
		var amount = args[1];
		var coords = [args[2], args[3], args[4]];
		var spread = args[5];
		var event = "";
		var name = "";
		if (args[6]) event = args[6];
		if (args[7]) name = args[7];

		output.push("tickingarea add circle 0 0 0 4 mobWave");
		output.push("fill -1 0 -1 1 4 1 bedrock 0 outline");

		for (var i = 0; i < amount; i++) {
			output.push("summon " + mob + " 0 2 0 " + event + " " + name);
		}

		output.push("spreadplayers " + coords[0] + " " + coords[2] + " 0.001 " + spread + " @e[x=0,z=0,y=1,r=3,type=!player]");

		output.push("tickingarea remove mobWave");

		return output;
	})
})
