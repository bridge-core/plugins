export default defineCommand(({ name, template, schema }) => {
	name('kit')
	schema({
		description: "Gears up an entity's armor, mainhand, and offhand in one command. It's like multiple /replaceitem commands, but in one line.",
		arguments: [
			{ type: "selector" }, //The entity to target
			{
				type: "string",
				additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/item_identifiers"
				}
			}, //Head Slot
			{
				type: "string",
				additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/item_identifiers"
				}
			}, //Chest Slot
			{
				type: "string",
				additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/item_identifiers"
				}
			}, //Legs Slot
			{
				type: "string",
				additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/item_identifiers"
				}
			}, //Feet Slot
			{
				type: "string",
				additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/item_identifiers"
				}
			}, //Mainhand Slot
			{
				type: "string",
				additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/item_identifiers"
				}
			}, //Offhand Slot
			{
				type: "boolean",
			} //Force items?
		]
	})

	template((args) => {
		console.log(args);
		var selector = args[0];
		var head = args[1];
		var chest = args[2];
		var legs = args[3];
		var feet = args[4];
		var mainhand = args[5];
		var offhand = args[6];
		var force = (args[7] ? "keep" : "destroy");

		var output = [
			"replaceitem entity " + selector + " slot.armor.head 0 " + force + " " + head,
			"replaceitem entity " + selector + " slot.armor.chest 0 " + force + " " + chest,
			"replaceitem entity " + selector + " slot.armor.legs 0 " + force + " " + legs,
			"replaceitem entity " + selector + " slot.armor.feet 0 " + force + " " + feet,
			"replaceitem entity " + selector + " slot.weapon.mainhand 0 " + force + " " + mainhand,
			"replaceitem entity " + selector + " slot.weapon.offhand 0 " + force + " " + offhand,
		];
		return output;
	})
})