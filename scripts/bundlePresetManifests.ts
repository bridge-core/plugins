// deno-lint-ignore-file no-explicit-any
import { join } from 'https://deno.land/std@0.85.0/path/mod.ts'
import json5 from 'https://esm.sh/json5@2.2.1'

export async function bundlePresetManifests(extensionPath: string) {
	const collectedManifests = await collectManifests(
		join(extensionPath, 'presets'),
		'presets'
	)
	if (Object.keys(collectedManifests).length === 0) return

	await Deno.writeTextFile(
		join(extensionPath, 'presets.json'),
		JSON.stringify(collectedManifests)
	)
}

async function collectManifests(
	presetPath: string,
	startPath = 'presets',
	current: any = {}
) {
	try {
		for await (const dirent of Deno.readDir(presetPath)) {
			if (dirent.isDirectory) {
				await collectManifests(
					join(presetPath, dirent.name),
					`${startPath}/${dirent.name}`,
					current
				)
			} else if (dirent.isFile && dirent.name === 'manifest.json') {
				current[`${startPath}/${dirent.name}`] = json5.parse(
					await Deno.readTextFile(join(presetPath, dirent.name))
				)
			}
		}
	} catch {
		// Do nothing
	}

	return current
}
