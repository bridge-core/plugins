export default defineCommand(({ name, template, schema }) => {
	name('flip')
	schema({
		description: "Flips a build on the X axis, Z axis, or both.",
		arguments: [
			{ type: "coordinate" }, //From X
			{ type: "coordinate" }, //From Y
			{ type: "coordinate" }, //From Z
			{ type: "coordinate" }, //To X
			{ type: "coordinate" }, //To Y
			{ type: "coordinate" }, //To Z
			{ type: "string", additionalData: { values: ["x", "z", "xz"] } } //Mirror type
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
			"structure save bridge-mirror " + coordsfrom.join(" ") + " " + coordsto.join(" ") + " false memory true",
			"structure load bridge-mirror " + coordsload.join(" ") + " 0_degrees " + rotationamount,
			"structure delete bridge-mirror"
		];

		return output;
	})
})
