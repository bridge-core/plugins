export default defineCommand(({ name, template, schema }) => {
	name('rotate')
	schema({
		description: "Rotates a build on the X and Z axies in any direction of your choice.",
		arguments: [
			{ type: "coordinate" }, //From X
			{ type: "coordinate" }, //From Y
			{ type: "coordinate" }, //From Z
			{ type: "coordinate" }, //To X
			{ type: "coordinate" }, //To Y
			{ type: "coordinate" }, //To Z
			{ type: "string", additionalData: { values: ["0_degrees", "90_degrees", "180_degrees", "270_degrees"] } } //Rotation amount
		]
	})

	template((args) => {
		var coordsfrom = [args[0], args[1], args[2]];
		var coordsto = [args[3], args[4], args[5]];
		var coordsload = [];

		for (var i = 0; i < 3; i++) {
			if (coordsfrom[i] < coordsto[i]) {
				coordsload.push(coordsfrom[i]);
			} else {
				coordsload.push(coordsto[i]);
			}
		}

		var rotationamount = args[6];

		var output = [
			"structure save bridge-rotate " + coordsfrom.join(" ") + " " + coordsto.join(" ") + " false memory true",
			"structure load bridge-rotate " + coordsload.join(" ") + " " + rotationamount,
			"structure delete bridge-rotate"
		];

		return output;
	})
})
