import { join } from 'https://deno.land/std@0.85.0/path/mod.ts'
import { JSZip } from 'https://raw.githubusercontent.com/hayd/deno-zip/master/mod.ts'

const v1Plugins = []
const v2Plugins = []

for await (const dirEntry of Deno.readDir('./plugins')) {
	if (dirEntry.isFile) continue
	console.log(`Processing plugin "${dirEntry.name}"...`)

	const zip = new JSZip()
	await readDirectory(zip, join('./plugins', dirEntry.name))
	await Deno.writeFile(
		join('./plugins', dirEntry.name, 'plugin.zip'),
		await zip.generateAsync<'uint8array'>({ type: 'uint8array' })
	)
	console.log(
		await Deno.readFile(join('./plugins', dirEntry.name, 'plugin.zip'))
	)

	const manifest = {
		...JSON.parse(
			await Deno.readTextFile(
				join('./plugins', dirEntry.name, 'manifest.json')
			)
		),
		link: `/plugins/${dirEntry.name}/plugin.zip`,
	}
	if (manifest.target === 'both') {
		v2Plugins.push(manifest)
		v1Plugins.push(manifest)
	} else if (manifest.target === 'v2') v2Plugins.push(manifest)
	else v1Plugins.push(manifest)
}

async function readDirectory(zip: JSZip, path: string) {
	for await (const dirEntry of Deno.readDir(path)) {
		if (dirEntry.isFile) {
			zip.addFile(
				dirEntry.name,
				await Deno.readFile(join(path, dirEntry.name))
			)
		} else if (dirEntry.isDirectory) {
			const folder = zip.folder(dirEntry.name)
			if (folder) await readDirectory(folder, join(path, dirEntry.name))
		}
	}
}

await Deno.writeTextFile('./plugins.json', JSON.stringify(v1Plugins))
await Deno.writeTextFile('./v2Plugins.json', JSON.stringify(v2Plugins))
