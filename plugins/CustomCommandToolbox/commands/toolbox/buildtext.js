export default defineCommand(({ name, template, schema }) => {
	name('buildtext')
	schema({
		description: "Writes capital letters at the coordinates of your choice.",
		arguments: [
			{
				type: "string"
			}, //The text to spell out
			{
				type: "string", additionalData: {
					schemaReference: "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/block_identifiers"
				}
			}, //The block to write it with
			{ type: "number" }, //The block's data value
			{ type: "coordinate" }, //X
			{ type: "coordinate" }, //Y
			{ type: "coordinate" }, //Z
			{ type: "string", additionalData: { values: ["+x", "-x", "+z", "-z"] } }, //Facing direction
			{ type: "number" }, //Letter Spacing
		]
	})

	template((args) => {
		var output = [];

		var text = args[0].toLowerCase();
		var block = args[1] + " " + args[2];
		var coords = [args[3], args[4], args[5]];
		var coordmodifiers = [];
		if (typeof args[3] != "number") { coordmodifiers.push(args[3][0]); args[3] = parseFloat("0" + args[3].slice(1)); } else { coordmodifiers.push(""); } 0
		if (typeof args[4] != "number") { coordmodifiers.push(args[4][0]); args[4] = parseFloat("0" + args[4].slice(1)); } else { coordmodifiers.push(""); }
		if (typeof args[5] != "number") { coordmodifiers.push(args[5][0]); args[5] = parseFloat("0" + args[5].slice(1)); } else { coordmodifiers.push(""); }

		var currentCoords = [args[3], args[4], args[5]];

		var letterspacing = args[7] || 1;

		//Tell rotation difference, +x=0, +z=90, -x=180, -z=270
		var rotCoordModifier = [+1, +1, -1, -1][["+x", "+z", "-x", "-z"].indexOf(args[6])];
		var rotCoordIndex = [0, 2, 0, 2][["+x", "+z", "-x", "-z"].indexOf(args[6])];
		var rotName = ["0_degrees", "90_degrees", "180_degrees", "270_degrees"][["+x", "+z", "-x", "-z"].indexOf(args[6])];
		var rotblockdata = [7, 11, 7, 11][["+x", "+z", "-x", "-z"].indexOf(args[6])];

		if (args[6][0] == "-") {
			coords[rotCoordIndex] -= (letterdata[text[0]].width - 1);
			currentCoords[rotCoordIndex] -= (letterdata[text[0]].width - 1);
		}

		for (var i = 0; i < text.length; i++) {
			var letter = text[i];
			if (letterdata[letter]) {
				if (letterdata[letter].name) {
					output.push("structure load " + letterdata[letter].name + " " + coordmodifiers[0] + currentCoords[0] + " " + coordmodifiers[1] + currentCoords[1] + " " + coordmodifiers[2] + currentCoords[2] + " " + rotName);
					currentCoords[rotCoordIndex] += (letterdata[letter].width + letterspacing) * rotCoordModifier;
				} else {
					//Blank space or undefined
					if (letterdata[letter].width) {
						currentCoords[rotCoordIndex] += (letterdata[letter].width + letterspacing) * rotCoordModifier;
					} else {
						//No width defined
						currentCoords[rotCoordIndex] += (3 + letterspacing) * rotCoordModifier;
					}
				}
			} else {
				//Does not exist, add space.
				currentCoords[rotCoordIndex] += (3 + letterspacing) * rotCoordModifier;
			}

		}

		currentCoords[rotCoordIndex] += (6 * rotCoordModifier);
		if (args[6][0] == "-") {
			coords[rotCoordIndex] += (letterdata[text[0]].width - 1);
		}

		output.push("fill " + coords.join(' ') + " " + coordmodifiers[0] + currentCoords[0] + " " + coordmodifiers[1] + (currentCoords[1] + 5) + " " + coordmodifiers[2] + currentCoords[2] + " " + block + " replace purpur_block " + rotblockdata);

		return output;
	})
})

var letterdata = {
	"a": { name: "bridge:buildtext_a", width: 4 },
	"b": { name: "bridge:buildtext_b", width: 4 },
	"c": { name: "bridge:buildtext_c", width: 4 },
	"d": { name: "bridge:buildtext_d", width: 4 },
	"e": { name: "bridge:buildtext_e", width: 4 },
	"f": { name: "bridge:buildtext_f", width: 4 },
	"g": { name: "bridge:buildtext_g", width: 4 },
	"h": { name: "bridge:buildtext_h", width: 4 },
	"i": { name: "bridge:buildtext_i", width: 3 },
	"j": { name: "bridge:buildtext_j", width: 4 },
	"k": { name: "bridge:buildtext_k", width: 4 },
	"l": { name: "bridge:buildtext_l", width: 4 },
	"m": { name: "bridge:buildtext_m", width: 5 },
	"n": { name: "bridge:buildtext_n", width: 4 },
	"o": { name: "bridge:buildtext_o", width: 4 },
	"p": { name: "bridge:buildtext_p", width: 4 },
	"q": { name: "bridge:buildtext_q", width: 4 },
	"r": { name: "bridge:buildtext_r", width: 4 },
	"s": { name: "bridge:buildtext_s", width: 4 },
	"t": { name: "bridge:buildtext_t", width: 3 },
	"u": { name: "bridge:buildtext_u", width: 4 },
	"v": { name: "bridge:buildtext_v", width: 5 },
	"w": { name: "bridge:buildtext_w", width: 5 },
	"x": { name: "bridge:buildtext_x", width: 3 },
	"y": { name: "bridge:buildtext_y", width: 3 },
	"z": { name: "bridge:buildtext_z", width: 4 },
	"1": { name: "\"bridge:buildtext_1\"", width: 3 },
	"2": { name: "\"bridge:buildtext_2\"", width: 4 },
	"3": { name: "\"bridge:buildtext_3\"", width: 4 },
	"4": { name: "\"bridge:buildtext_4\"", width: 3 },
	"5": { name: "\"bridge:buildtext_5\"", width: 4 },
	"6": { name: "\"bridge:buildtext_6\"", width: 4 },
	"7": { name: "\"bridge:buildtext_7\"", width: 4 },
	"8": { name: "\"bridge:buildtext_8\"", width: 4 },
	"9": { name: "\"bridge:buildtext_9\"", width: 4 },
	"0": { name: "\"bridge:buildtext_0\"", width: 4 },
	"!": { name: "bridge:buildtext_exclamation", width: 1 },
	"#": { name: "bridge:buildtext_hashtag", width: 5 },
	"%": { name: "bridge:buildtext_percent", width: 5 },
	"*": { name: "bridge:buildtext_asterisk", width: 4 },
	")": { name: "bridge:buildtext_bracket_close", width: 2 },
	"(": { name: "bridge:buildtext_bracket_open", width: 2 },
	"|": { name: "bridge:buildtext_verticalLine", width: 1 },
	",": { name: "bridge:buildtext_comma", width: 1 },
	".": { name: "bridge:buildtext_period", width: 1 },
	"/": { name: "bridge:buildtext_slash", width: 4 },
	"?": { name: "bridge:buildtext_question", width: 3 },
	";": { name: "bridge:buildtext_semicolon", width: 1 },
	":": { name: "bridge:buildtext_colon", width: 1 },
	"'": { name: "bridge:buildtext_quote", width: 1 },
	"\"": { name: "bridge:buildtext_doublequote", width: 3 },
	"-": { name: "bridge:buildtext_dash", width: 4 },
	"+": { name: "bridge:buildtext_plus", width: 3 },
	"=": { name: "bridge:buildtext_equals", width: 4 },
	"÷": { name: "bridge:buildtext_divide", width: 5 },
	"×": { name: "bridge:buildtext_times", width: 3 },
	"_": { name: "bridge:buildtext_underscore", width: 4 },
	"•": { name: "bridge:buildtext_dot", width: 2 },
	"~": { name: "bridge:buildtext_tilde", width: 6 },
	"^": { name: "bridge:buildtext_caret", width: 5 },
	" ": { width: 3 },
};