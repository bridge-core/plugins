export default defineCommand(({ name, template, schema }) => {
	name('scoredetails')
	schema([
		{
			description: "Displays all recorded values of a scoreboard objective in chat.",
			arguments: [
				{
					type: "string",
					additionalData: {
						schemaReference: "/data/packages/minecraftBedrock/schema/function/dynamic/scoreboardObjectiveEnum.json"
					}
				}
			]
		}
	])

	template((args) => {
		var output = [];
		var objective = args[0];
		output = output.concat([
			'tellraw @s {"rawtext":[{"text": "§aShowing all tracked values of loaded entities with objective ' + objective + ':"}]}',
			'tag @s add bridge_scoredetails',
			'execute @e[scores={' + objective + '=-2147483648..}] ~ ~ ~ tellraw @a[tag=bridge_scoredetails] {"rawtext":[{"text":"- "},{"selector":"@s"},{"text":": "},{"score":{"name":"@s","objective":"' + objective + '"}}]}',
			'tag @s remove bridge_scoredetails'
		]);
		//Display all the mobs with a score on the scoreboard

		return output;
	})
})