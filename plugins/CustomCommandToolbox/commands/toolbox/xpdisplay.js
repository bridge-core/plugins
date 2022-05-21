export default defineCommand(({ name, template, schema }) => {
	name('xpdisplay')
	schema({
		description: "Uses the XP bar to display numbers.",
		arguments: [
			{ type: "selector" }, //Player
			{ type: "number" }, //Percentage filled
			{ type: "number" } //Level display
		]
	})

	template(([selector, percent, level]) => {
		var output = [
			"xp -2147483648L" + selector
		];
		percent /= 100;
		var amount = 0;

		if (level <= 15) {
			//2 * level + 7 = 100%
			amount = Math.floor((2 * level + 7) * percent);
		} else if (level > 15 && level < 30) {
			//5 * level - 38 = 100%
			amount = Math.floor((5 * level - 38) * percent);
		} else {
			//9 * level - 158 = 100%
			amount = Math.floor((9 * level - 158) * percent);
		}
		output.push("xp " + level + "L " + selector);
		output.push("xp " + amount + " " + selector);

		return output;
	})
})
