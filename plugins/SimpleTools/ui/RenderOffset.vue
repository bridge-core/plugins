<template>
	<div style="padding:10px; overflow:scroll;">
		<h1>Render Offset Corrector</h1>
		<div class="TitleButtonsROGrid"></div>
		<v-btn icon @click="ShowInfoWindow('Automatic Input','Allows you to switch between manual resolution input and selecting an image for automatic input. Must have a project with a resource pack and item textures already defined in item_textures.json to work.')">
			<v-icon>mdi-information-outline</v-icon>
		</v-btn>
		<v-switch v-model="AutomaticInput" style="margin-top: 0" inset dense :label="'Automatic Input'" />
		<v-autocomplete style="margin-top: 5px" v-if="AutomaticInput" inset dense mandatory outlined
			@click.native="onClick" v-model="SelectedImage" :items="Images" hide-details :menu-props="{
				maxHeight: 220,
				rounded: 'lg',
				'nudge-top': -8,
				transition: 'slide-y-transition'
			}" />
		<v-btn v-if="!AutomaticInput" icon @click="ShowInfoWindow('Image Resolution','The image height and width. BOTH HAVE TO BE THE SAME VALUES')">
			<v-icon>mdi-information-outline</v-icon>
		</v-btn>
		<div v-if="!AutomaticInput">
			<v-text-field type="number" outlined label="Image Resolution" v-model="ImageRes"></v-text-field>
		</div>
		<v-btn color="primary" @click="Generate" :disabled="AutomaticInput && SelectedImage == '' || ImageRes <= 0 && !AutomaticInput">
			Generate</v-btn>
		<v-btn @click="CopyOutput" :disabled="Output == 'No Data'">Copy Output</v-btn>
		<v-btn v-if="Errored" icon color="error" @click="ShowInfoWindow('ERROR','The generation errored! Press the generate button to regenerate again. If you see NULL in the scale values keep regenerating!')">
			<v-icon>mdi-information-outline</v-icon>
		</v-btn>
		<br></br>
		<div class="Output">
			<pre ref="text">{{ Output }}</pre>
		</div>
		<div class="Toast" id="Popup">
			<h2>Copied</h2>
		</div>
	</div>
</template>

<script>
import { createInformationWindow } from "@bridge/windows";
import { getCurrentRP } from '@bridge/env';
import { directoryExists, fileExists, readJSON, getFileHandle, loadFileHandleAsDataUrl } from '@bridge/fs';
import { stringify } from '@bridge/json5'

export default {
	data: () => ({
		AutomaticInput: false,
		Images: [],
		SelectedImage: "",
		ImageRes: 0,
		Output: "No Data",
		Errored: false
	}),
	methods: {
		async onClick() {
			var Pack = await getCurrentRP();
			if (await directoryExists(Pack) && await fileExists(Pack + "/textures/item_texture.json")) {
				const file = await readJSON(Pack + "/textures/item_texture.json");
				const values = Object.values(file.texture_data);
				values.forEach(val => {
					if (typeof val.textures == 'object')
						this.Images.push(val.textures[0]);
					else
						this.Images.push(val.textures);
				});
			}
		},
		async Generate() {
			var res = 0;
			var Scales = [];
			var img = new Image();
			const Pack = await getCurrentRP();
			if(await fileExists(Pack + "/" + this.SelectedImage + ".png")) {
				const file = await getFileHandle(Pack + "/" + this.SelectedImage + ".png");
				img.src = await loadFileHandleAsDataUrl(file);
				res = img.width;
			}
			else if(await fileExists(Pack + "/" + this.SelectedImage + ".jpg")) {
				const file = await getFileHandle(Pack + "/" + this.SelectedImage + ".jpg");
				img.src = await loadFileHandleAsDataUrl(file);
				res = img.width;
			}
			else if(await fileExists(Pack + "/" + this.SelectedImage + ".jpeg")) {
				const file = await getFileHandle(Pack + "/" + this.SelectedImage + ".jpeg");
				img.src = await loadFileHandleAsDataUrl(file);
				res = img.width;
			}
			else if(this.AutomaticInput) {
				this.ShowInfoWindow("ERROR!", "Error! Image does not exist!");
				return;
			}
			if(this.AutomaticInput)
			{
				Scales = [
					0.075 / (res / 16),
					0.125 / (res / 16),
					0.075 / (res / 16)
				]
			}
			else
			{
				Scales = [
					0.075 / (this.ImageRes / 16),
					0.125 / (this.ImageRes / 16),
					0.075 / (this.ImageRes / 16)
				]
			}
			var DataOut = {
				'minecraft:render_offsets': {
					'main_hand': {
						'first_person': { 'scale': Scales },
						'third_person': { 'scale': Scales }
					},
					'off_hand': {
						'first_person': { 'scale': Scales },
						'third_person': { 'scale': Scales }
					}
				}
			}
			this.Output = stringify(DataOut);
			if(Scales[0] == Infinity)
				this.Errored = true;
			else
				this.Errored = false;
		},
		CopyOutput() {
			navigator.clipboard.writeText(this.Output);
			var Toast = document.getElementById("Popup");
			Toast.style.animation = "PopupAnimation 2s";
			Toast.addEventListener("animationend", (ev) => {
				ev.target.style.animation = "";
				Toast.removeEventListener("animationend", (ev) => { });
			});
		},
		ShowInfoWindow(displayName, description) {
			createInformationWindow(displayName, description);
		}
	}
}
</script>

<style>
.TitleButtonsRTGrid {
	justify-content: space-evenly;
	margin: 0 auto;
	display: grid;
	grid-gap: 1rem;
}

.Output {
	background: rgb(32, 32, 32);
	border-radius: 5px;
	padding: 5px;
}

pre {
	font-family: "Roboto", sans-serif;
	overflow-wrap: break-word;
	overflow: hidden;
}

.Toast {
	background-color: rgba(10, 10, 10, 0.9);
	color: rgb(0, 200, 0);
	border-radius: 5px;
	position: fixed;
	bottom: -100px;
	padding: 2px;
	display: block;
	width: 100%;
	text-align: center;
	left: 0;
}

@keyframes PopupAnimation {
	0% {
		bottom: -100px;
	}

	20% {
		bottom: 40px;
	}

	40% {
		bottom: 30px;
	}

	60% {
		bottom: 30px;
	}

	75% {
		bottom: 40px;
	}

	100% {
		bottom: -100px;
	}
}
</style>