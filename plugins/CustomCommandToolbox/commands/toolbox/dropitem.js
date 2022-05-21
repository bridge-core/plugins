export default defineCommand(({ name, template, schema }) => {
	name('dropitem')
	schema({
		description: "Drops one or more items at the specified coordinates. The limit for how many items can be dropped at once is its stack size.",
		arguments: [
			{
				type: "string", additionalData: {
					"schemaReference": "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/item_identifiers"
				}
			}, //The item to drop
			{ type: "number" }, //Amount 1-64
			{ type: "coordinate" }, //X
			{ type: "coordinate" }, //Y
			{ type: "coordinate" } //Z
		]
	})

	template((args) => {
		var output = [];
		output.push("tickingarea add circle 0 0 0 4 dropItem")
		output.push("setblock 0 -63 0 chest");
		output.push("fill -1 -64 -1 1 -62 1 bedrock 0 outline");
		output.push("replaceitem block 0 -63 0 slot.container 0 " + args[0] + " " + args[1]);
		output.push("fill 0 -63 0 0 -63 0 air 0 destroy");
		output.push("kill @e[type=item,name=Chest]");
		output.push("tp @e[type=item,x=0,y=1,z=0,r=1] " + args[2] + " " + args[3] + " " + args[4] + " ");
		output.push("tickingarea remove dropItem");
		return output;
	})
})
