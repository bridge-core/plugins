import { join } from 'https://deno.land/std@0.85.0/path/mod.ts'

const ids = new Set<string>()
const v2Ids = new Set<string>()
for await (const dirEntry of Deno.readDir('./plugins')) {
	if (dirEntry.isFile) continue
	const extensionName = join(dirEntry.name, 'manifest.json')

	let manifest
	try {
		manifest = JSON.parse(
			await Deno.readTextFile(
				join('./plugins', dirEntry.name, 'manifest.json')
			)
		)
	} catch {
		throw new Error(`Invalid manifest file: ${extensionName}`)
	}

	// Ensure that manifest has tags & that it's of the correct type
	if (manifest.tags === undefined)
		throw new Error(
			`[${extensionName}] Extension must define category tags in its manifest`
		)
	if (!Array.isArray(manifest.tags))
		throw new Error(
			`[${extensionName}] Expecting manifest.tags to be a string array, found ${typeof manifest}`
		)

	// Check version
	if (typeof manifest.version !== 'string')
		throw new Error(
			`[${extensionName}] manifest.version is of type "${typeof manifest.version}", expected "string"`
		)

	// Check IDs
	if (manifest.target === 'v2') {
		if (v2Ids.has(manifest.id))
			throw new Error(
				`[${extensionName}] manifest.id is already in use by another extension`
			)
		v2Ids.add(manifest.id)
	} else {
		if (ids.has(manifest.id))
			throw new Error(
				`[${extensionName}] manifest.id is already in use by another extension`
			)
		ids.add(manifest.id)
	}
}
