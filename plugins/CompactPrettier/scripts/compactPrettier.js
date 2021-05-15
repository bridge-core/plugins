// ass
let PARAMS = { maxLength: 150, indent: 4, spacing: true }

const { registerDocumentFormattingEditProvider } = await require('@bridge/monaco');
const { parse } = await require('@bridge/json5');
const { create } = await require('@bridge/sidebar');
const { Options } = await require('@bridge/ui');
const { readJSON } = await require('@bridge/fs')

// Register the formatting provider
registerDocumentFormattingEditProvider('json', {
	async provideDocumentFormattingEdits(model, options, token) {
		PARAMS = await readJSON('extensions/CompactPrettier/options.json')
		return [
			{
				text: formatText(model.getValue()),
				range: model.getFullModelRange(),
			},
		]
	},
});

// src is of type string here because model.getValue() returns a string
function formatText(src) {
	try {
		function stringify(passedObj, options) {
			let stringOrChar = /("(?:[^\\"]|\\.)*")|[:,]/g;
			var indent, maxLength, replacer;
			options = options || {};
			indent = JSON.stringify(
				[1],
				undefined,
				options.indent === undefined ? 2 : options.indent
			).slice(2, -3);
			maxLength =
				indent === ""
					? Infinity
					: options.maxLength === undefined
						? 80
						: options.maxLength;
			replacer = options.replacer;
			return (function _stringify(obj, currentIndent, reserved) {
				var end, index, items, key, keyPart, keys, length, nextIndent, prettified, start, string, value;
				if (obj && typeof obj.toJSON === "function") {
					obj = obj.toJSON();
				}
				string = JSON.stringify(obj, replacer);
				if (string === undefined) {
					return string;
				}
				length = maxLength - currentIndent.length - reserved;
				if (string.length <= length) {
					prettified = string.replace(stringOrChar, function (match, stringLiteral) {
						return stringLiteral || match + " ";
					});
					if (prettified.length <= length) {
						return prettified;
					}
				}
				if (replacer != null) {
					obj = JSON.parse(string);
					replacer = undefined;
				}
				if (typeof obj === "object" && obj !== null) {
					nextIndent = currentIndent + indent;
					items = [];
					index = 0;
					if (Array.isArray(obj)) {
						start = "[";
						end = "]";
						length = obj.length;
						for (; index < length; index++) {
							items.push(
								_stringify(obj[index], nextIndent, index === length - 1 ? 0 : 1) ||
								"null"
							);
						}
					} else {
						start = "{";
						end = "}";
						keys = Object.keys(obj);
						length = keys.length;
						for (; index < length; index++) {
							key = keys[index];
							keyPart = JSON.stringify(key) + ": ";
							value = _stringify(
								obj[key],
								nextIndent,
								keyPart.length + (index === length - 1 ? 0 : 1)
							);
							if (value !== undefined) {
								items.push(keyPart + value);
							}
						}
					}
					if (items.length > 0) {
						return [start, indent + items.join(",\n" + nextIndent), end].join(
							"\n" + currentIndent
						);
					}
				}
				return string;
			})(passedObj, "", 0);
		};
		let data_out = stringify(parse(src), PARAMS);
		if (PARAMS.spacing) { data_out = data_out.replace(/(?<={|\[)(?="|[0-9]|-)|(?<=[0-9]|")(?=}|\])/g, ' ') };
		return data_out
	}
	catch { return src.substring(1) };
}

const sidebar = create({
	icon: 'mdi-code-json',
	displayName: 'Compact Prettier Options',
	component: Options,
})