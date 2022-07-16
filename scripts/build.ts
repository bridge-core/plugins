// deno-lint-ignore-file no-explicit-any
import { join } from 'https://deno.land/std@0.85.0/path/mod.ts'
import { JSZip } from 'https://raw.githubusercontent.com/hayd/deno-zip/master/mod.ts'
import { bundlePresetManifests } from './bundlePresetManifests.ts'
import { parse } from 'https://deno.land/std@0.148.0/flags/mod.ts'

const { _, force } = parse(Deno.args)

const builtV2Packages = new Map<string, any>(
	force
		? []
		: JSON.parse(await Deno.readTextFile('extensions.json')).map(
				(extension: any) => [extension.id, extension.version]
		  )
)
const builtV1Packages = new Map<string, any>(
	force
		? []
		: JSON.parse(await Deno.readTextFile('plugins.json')).map(
				(extension: any) => [extension.id, extension.version]
		  )
)

const v1Plugins = []
const extensions = []

for await (const dirEntry of Deno.readDir('./plugins')) {
	if (dirEntry.isFile) continue
	console.log(`Processing plugin "${dirEntry.name}"...`)
	const extensionPath = join('./plugins', dirEntry.name)

	// Load manifest
	let manifest
	try {
		manifest = JSON.parse(
			await Deno.readTextFile(join(extensionPath, 'manifest.json'))
		)
	} catch {
		// No manifest, remove generated ZIP
		await Deno.remove(join(extensionPath, 'plugin.zip'))
		continue
	}
	// Store whether the project is a v2 project
	const isV2Project = manifest.target === 'v2' || manifest.target === 'both'

	// Find out whether we have already built this version of the extension
	if (
		(isV2Project &&
			builtV2Packages.get(manifest.id) !== manifest.version) ||
		(!isV2Project && builtV1Packages.get(manifest.id) !== manifest.version)
	) {
		if (isV2Project) await bundlePresetManifests(extensionPath)

		const zip = new JSZip()
		await readDirectory(zip, extensionPath, isV2Project)
		await Deno.writeFile(
			join(extensionPath, 'plugin.zip'),
			await zip.generateAsync<'uint8array'>({ type: 'uint8array' })
		)

		// Add release timestamp
		if (!manifest.releaseTimestamp) {
			manifest.releaseTimestamp = Date.now()
			await Deno.writeTextFile(
				join(extensionPath, 'manifest.json'),
				JSON.stringify(manifest, null, '\t')
			)
		}
	}

	// Add download link
	manifest.link = `/plugins/${dirEntry.name}/plugin.zip`

	if (manifest.target === 'both') {
		extensions.push(manifest)
		v1Plugins.push(manifest)
	} else if (manifest.target === 'v2') extensions.push(manifest)
	else v1Plugins.push(manifest)
}

async function readDirectory(
	zip: JSZip,
	path: string,
	shouldOmitPresetManifests = false
) {
	for await (const dirEntry of Deno.readDir(path)) {
		if (dirEntry.isDirectory) {
			const folder = zip.folder(dirEntry.name)
			if (folder)
				await readDirectory(
					folder,
					join(path, dirEntry.name),
					shouldOmitPresetManifests
				)
			continue
		}
		if (!dirEntry.isFile) continue

		const omitPresetManifest =
			shouldOmitPresetManifests &&
			path.includes('presets') &&
			dirEntry.name === 'manifest.json'
		const isPluginZip = dirEntry.name === 'plugin.zip'

		if (dirEntry.isFile && !omitPresetManifest && !isPluginZip) {
			zip.addFile(
				dirEntry.name,
				await Deno.readFile(join(path, dirEntry.name))
			)
		}
	}
}

await Deno.writeTextFile(
	'./plugins.json',
	JSON.stringify(
		v1Plugins.sort((a, b) => b.releaseTimestamp - a.releaseTimestamp)
	)
)
await Deno.writeTextFile(
	'./extensions.json',
	JSON.stringify(
		extensions.sort((a, b) => b.releaseTimestamp - a.releaseTimestamp)
	)
)
