<template>
	<div style="padding:10px; overflow:scroll;">
		<h1>Script UI Generator</h1>
		<div class="TitleButtonsGTGrid">
			<v-btn v-if="Selection == 0" class="TitleButton" color="primary" block>Action</v-btn>
			<v-btn v-if="Selection != 0" class="TitleButton" block @click="SelectActionForm">Action</v-btn>
			<v-btn v-if="Selection == 1" class="TitleButton" color="primary" block>Message</v-btn>
			<v-btn v-if="Selection != 1" class="TitleButton" block @click="SelectMessageForm">Message</v-btn>
			<v-btn v-if="Selection == 2" class="TitleButton" color="primary" block>Modal</v-btn>
			<v-btn v-if="Selection != 2" class="TitleButton" block @click="SelectModalForm">Modal</v-btn>
		</div>
		<div v-if="Selection == 0">
			<v-btn block color="primary" @click="AddAFButton" style="margin-top: 5px;">Add Button</v-btn>
			<p
				style="color:black; font-family: Mojangles; position:relative; text-align: center; transform: translateY(55px);">
				{{ ActionFormTitle }}</p>
			<div class="GTActionFormPreview">
				<p v-if="ActionFormBody != ''" style="font-family: Mojangles; overflow-wrap: break-word;">{{
						ActionFormBody
				}}</p>
				<div v-for="Button in ActionFormButtons">
					<div v-if="!Button.ImagePath" class="MCButton">
						<span style="color: black; font-family: Mojangles;">{{ Button.Title
						}}</span>
					</div>
					<div v-if="Button.ImagePath != ''" class="MCAFButtonDisplayer">
						<img v-bind:src="Button.ImgValue" class="AFMCButtonIcon" />
						<div class="MCButton">
							<span style="color: black; font-family: Mojangles;">{{
									Button.Title
							}}</span>
						</div>
					</div>
				</div>
			</div>
			<v-btn color="primary" @click="GenerateActionForm" :disabled="!ActionFormTitle">Generate</v-btn>
			<v-btn @click="CopyActionFormOutput" :disabled="GeneratedActionForm == 'No Data'">Copy Output</v-btn>
			<br></br>
			<div class="Output">
				<pre ref="text">{{ GeneratedActionForm }}</pre>
			</div>
			<div class="RTEditor">
				<h2>Editor</h2>
				<v-text-field outlined label="Form Title" v-model="ActionFormTitle">
				</v-text-field>
				<v-text-field outlined label="Form Body" v-model="ActionFormBody">
				</v-text-field>
				<transition-group name="GTAF-flip-list" tag="v-card">
					<v-card class="GTAFBTModule" v-for="(button, i) in ActionFormButtons" style="margin-bottom: 0.8rem"
						color="sidebarSelection" :key="button.Id">
						<v-card-title>Button</v-card-title>
						<v-card-text>
							<v-text-field outlined label="Title" v-model="button.Title">
							</v-text-field>
							<v-text-field outlined label="Icon Path" v-model="button.ImagePath"
								@change="GetImagePlaceholder(button)">
							</v-text-field>
						</v-card-text>
						<v-card-actions>
							<v-btn icon color="error" @click="DeleteAFButton(i)">
								<v-icon> mdi-delete </v-icon>
							</v-btn>
							<v-btn icon color="primary" @click="MoveAFButtonUp(i)" :disabled="i == 0">
								<v-icon> mdi-arrow-up-box </v-icon>
							</v-btn>
							<v-btn icon color="primary" @click="MoveAFButtonDown(i)"
								:disabled="i == ActionFormButtons.length - 1">
								<v-icon> mdi-arrow-down-box </v-icon>
							</v-btn>
						</v-card-actions>
					</v-card>
				</transition-group>
			</div>
		</div>
		<div v-if="Selection == 1">
			<p
				style="color:black; font-family: Mojangles; position:relative; text-align: center; transform: translateY(55px);">
				{{ MessageFormTitle }}</p>
			<div class="GTMessageFormPreview">
				<p v-if="MessageFormBody != ''" style="font-family: sans-serif; overflow-wrap: break-word;">{{
						MessageFormBody
				}}</p>
			</div>
			<div class="GTMSFButtons" style="margin: 0 auto;">
				<div class="MCButton">
					<span style="color: black; font-family: Mojangles;">{{ MessageFormBTN1 }}</span>
				</div>
				<div class="MCButton">
					<span style="color: black; font-family: Mojangles;">{{ MessageFormBTN2 }}</span>
				</div>
			</div>
			<v-btn color="primary" @click="GenerateMessageForm"
				:disabled="!MessageFormTitle || !MessageFormBTN1 || !MessageFormBTN2">Generate</v-btn>
			<v-btn @click="CopyMessageFormOutput" :disabled="GeneratedMessageForm == 'No Data'">Copy Output</v-btn>
			<br></br>
			<div class="Output">
				<pre ref="text">{{ GeneratedMessageForm }}</pre>
			</div>
			<div class="RTEditor">
				<h2>Editor</h2>
				<v-text-field outlined label="Form Title" v-model="MessageFormTitle">
				</v-text-field>
				<v-text-field outlined label="Form Body" v-model="MessageFormBody">
				</v-text-field>
				<v-text-field outlined label="Button 1" v-model="MessageFormBTN1">
				</v-text-field>
				<v-text-field outlined label="Button 2" v-model="MessageFormBTN2">
				</v-text-field>
			</div>
		</div>
		<div v-if="Selection == 2">
			<p
				style="color:black; font-family: Mojangles; position:relative; text-align: center; transform: translateY(55px);">
				{{ ModalFormTitle }}</p>
			<div class="GTActionFormPreview">
				<div v-for="(Component, i) in ModalFormContent">
					<div v-if="Component.Type == 'Toggle'" class="ModalToggleDisplayer">
						<div v-if="!Component.Toggled" @click="ToggleOn(Component)" class="MCToggleOff"></div>
						<div v-if="Component.Toggled" @click="ToggleOff(Component)" class="MCToggleOn"></div>
						<span
							style="color: var(--v-text-base); font-family: Mojangles; overflow-wrap: break-word; overflow: hidden;">{{
									Component.Title
							}}</span>
					</div>
					<div v-if="Component.Type == 'Textbox'">
						<span
							style="color: var(--v-text-base); font-family: Mojangles; overflow-wrap: break-word; overflow: hidden;">{{
									Component.Title
							}}</span>
						<input type="text" v-bind:placeholder="Component.Placeholder" v-model="Component.Default"
							class="MCTextbox" />
					</div>
					<div v-if="Component.Type == 'Slider'">
						<span
							style="color: var(--v-text-base); font-family: Mojangles; overflow-wrap: break-word; overflow: hidden;">{{
									Component.Title
							}}</span>
						<input type="range" v-bind:min="Component.Min" v-bind:max="Component.Max"
							v-bind:value="Component.Default" v-bind:step="Component.Step" class="MCSlider"
							v-model="Component.Default" />
					</div>
					<div v-if="Component.Type == 'Dropdown'">
						<span
							style="color: var(--v-text-base); font-family: Mojangles; overflow-wrap: break-word; overflow: hidden;">{{
									Component.Title
							}}</span>
						<div class="MCDropdown" @click="ShowHideDropdown(Component)">
							<span
							style="display: inline-block; color: black; font-family: Mojangles; overflow-wrap: break-word; overflow: hidden;">{{
									Component.Options[Component.Default]
							}}</span>
							<div v-if="!Component.Selected" class="MCDropdownArrow"></div>
							<div v-if="Component.Selected" class="MCDropdownArrowActive"></div>
							<div v-if="Component.Selected" class="MCDropdownContent">
								<div v-for="(Selection, i) in Component.Options" class="MCDropdownSelection" @click="SetSelectionDefault(Component, i)">
									<div v-if="i == Component.Default" class="MCDropdownRadioButtonOn"></div>
									<div v-else class="MCDropdownRadioButtonOff"></div>
									<span style="color: black; font-family: Mojangles; overflow-wrap: break-word; overflow: hidden;">{{
									Selection }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="MCButton">
					<span style="color: black; font-family: Mojangles;">Submit</span>
				</div>
			</div>
			<v-btn color="primary" @click="GenerateModalForm"
				:disabled="ModalFormContent.length == 0">Generate</v-btn>
			<v-btn @click="CopyModalFormOutput" :disabled="GeneratedModalForm == 'No Data'">Copy Output</v-btn>
			<br></br>
			<div class="Output">
				<pre ref="text">{{ GeneratedModalForm }}</pre>
			</div>
			<div class="RTEditor">
				<h2>Editor</h2>
				<div class="GTModalAdders">
					<v-btn style="margin-bottom: 4px;" block color="primary" @click="AddToggle">Add Toggle</v-btn>
					<v-btn style="margin-bottom: 4px;" block color="primary" @click="AddTextbox">Add Textbox</v-btn>
					<v-btn style="margin-bottom: 8px;" block color="primary" @click="AddDrodown">Add Dropdown</v-btn>
					<v-btn style="margin-bottom: 8px;" block color="primary" @click="AddSlider">Add Slider</v-btn>
				</div>
				<v-text-field outlined label="Form Title" v-model="ModalFormTitle"></v-text-field>
				<transition-group name="GTAF-flip-list" tag="v-card">
					<v-card v-for="(Module, i) in ModalFormContent" style="margin-bottom: 0.8rem"
						color="sidebarSelection" :key="Module.Id">
						<v-card-title>{{ Module.Type }}</v-card-title>
						<v-card-text v-if="Module.Type == 'Toggle'">
							<v-text-field outlined label="Label" v-model="Module.Title"></v-text-field>
							<v-switch v-model="Module.Toggled" style="margin-top: 0" inset dense :label="'Default Value'" />
						</v-card-text>
						<v-card-text v-if="Module.Type == 'Textbox'">
							<v-text-field outlined label="Label" v-model="Module.Title"></v-text-field>
							<v-text-field outlined label="Default Value" v-model="Module.Default"></v-text-field>
							<v-text-field outlined label="Placeholder" v-model="Module.Placeholder"></v-text-field>
						</v-card-text>
						<v-card-text v-if="Module.Type == 'Slider'">
							<v-text-field outlined label="Label" v-model="Module.Title"></v-text-field>
							<v-text-field type="number" typeof="number" outlined label="Default Value" v-model="Module.Default"></v-text-field>
							<v-text-field type="number" typeof="number" outlined label="Step Value" v-model="Module.Step"></v-text-field>
							<v-text-field type="number" typeof="number" outlined label="Minimum Value" v-model="Module.Min"></v-text-field>
							<v-text-field type="number" typeof="number" outlined label="Maximum Value" v-model="Module.Max"></v-text-field>
						</v-card-text>
						<v-card-text v-if="Module.Type == 'Dropdown'">
							<v-text-field outlined label="Label" v-model="Module.Title"></v-text-field>
							<v-text-field type="number" typeof="number" outlined label="Default Value" v-model="Module.Default"></v-text-field>
							<h2>Selections</h2>
							<v-btn block color="primary" @click="AddDrodownOption(Module)">Add Option</v-btn>
							<div v-for="(Selection,i) in Module.Options" style="padding: 5px; margin: 5px; background-color:var(--v-lineHighlightBackground-base); border-radius: 5px;">
								<v-text-field outlined label="Label" v-model="Module.Options[i]"></v-text-field>
								<v-btn icon color="error" @click="DeleteSelectionOption(Module,i)" :disabled="Module.Options.length == 1">
									<v-icon> mdi-delete </v-icon>
								</v-btn>
								<v-btn icon color="primary" @click="MoveSelectionOptionUp(Module,i)" :disabled="i == 0">
									<v-icon> mdi-arrow-up-box </v-icon>
								</v-btn>
								<v-btn icon color="primary" @click="MoveSelectionOptionDown(Module,i)" :disabled="i == Module.Options.length - 1">
									<v-icon> mdi-arrow-down-box </v-icon>
								</v-btn>
							</div>
						</v-card-text>
						<v-card-actions>
							<v-btn icon color="error" @click="DeleteModalModule(i)">
								<v-icon> mdi-delete </v-icon>
							</v-btn>
							<v-btn icon color="primary" @click="MoveModalModuleUp(i)" :disabled="i == 0">
								<v-icon> mdi-arrow-up-box </v-icon>
							</v-btn>
							<v-btn icon color="primary" @click="MoveModalModuleDown(i)"
								:disabled="i == ModalFormContent.length - 1">
								<v-icon> mdi-arrow-down-box </v-icon>
							</v-btn>
						</v-card-actions>
					</v-card>
				</transition-group>
			</div>
		</div>
		<div class="Toast" id="Popup">
			<h2>Copied</h2>
		</div>
	</div>
</template>

<script>
import { getFileHandle, loadFileHandleAsDataUrl, directoryExists } from "@bridge/fs";
import { getCurrentRP } from "@bridge/env";
import { stringify } from '@bridge/json5'

export default {
	data: () => ({
		Selection: 0,
		ActionFormTitle: "Example",
		MessageFormTitle: "Example",
		ModalFormTitle: "Example",
		ActionFormBody: "",
		MessageFormBody: "Example",
		MessageFormBTN1: "Button 1",
		MessageFormBTN2: "Button 2",
		ActionFormButtons: [],
		ModalFormContent: [],
		GeneratedActionForm: "No Data",
		GeneratedMessageForm: "No Data",
		GeneratedModalForm: "No Data"
	}),
	methods: {
		async GetImagePlaceholder(btn) {
			var Pack = await getCurrentRP();
			if (await directoryExists(Pack)) {
				try {
					var file = await getFileHandle(`${Pack}/${btn.ImagePath}`, false);
					if (file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) {
						var val = await loadFileHandleAsDataUrl(file);
						btn.ImgValue = val;
					}
					else {
						btn.ImgValue = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGNJREFUOE9j/P9A7X8n4wcGdFD+X4CBUeEWIy55kHqwGqoZUCH/ihHDGWgCHQ/F/oOEkNXCXTBqAO5oRA5HvIGIKx0QNABb1IFsgiWkUQNuoSRv2sQCodyIHAsgtSA+KJvDxAEbjKUZoepo9gAAAABJRU5ErkJggg=="
					}
				}
				catch {
					btn.ImgValue = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGNJREFUOE9j/P9A7X8n4wcGdFD+X4CBUeEWIy55kHqwGqoZUCH/ihHDGWgCHQ/F/oOEkNXCXTBqAO5oRA5HvIGIKx0QNABb1IFsgiWkUQNuoSRv2sQCodyIHAsgtSA+KJvDxAEbjKUZoepo9gAAAABJRU5ErkJggg=="
				}
			}
			else {
				btn.ImgValue = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAGNJREFUOE9j/P9A7X8n4wcGdFD+X4CBUeEWIy55kHqwGqoZUCH/ihHDGWgCHQ/F/oOEkNXCXTBqAO5oRA5HvIGIKx0QNABb1IFsgiWkUQNuoSRv2sQCodyIHAsgtSA+KJvDxAEbjKUZoepo9gAAAABJRU5ErkJggg=="
			}
			this.$forceUpdate()
		},
		SelectActionForm() {
			this.Selection = 0;
		},
		SelectMessageForm() {
			this.Selection = 1;
		},
		SelectModalForm() {
			this.Selection = 2;
		},
		AddAFButton() {
			this.ActionFormButtons.push(new ActionFormButton());
		},
		MoveAFButtonUp(Index) {
			MoveArray(this.ActionFormButtons, Index, Index - 1)
		},
		MoveAFButtonDown(Index) {
			MoveArray(this.ActionFormButtons, Index, Index + 1)
		},
		DeleteAFButton(Id) {
			this.ActionFormButtons.splice(Id, 1);
		},
		AddToggle() {
			this.ModalFormContent.push(new ModalFormToggle());
		},
		AddTextbox() {
			this.ModalFormContent.push(new ModalFormTextbox());
		},
		AddSlider() {
			this.ModalFormContent.push(new ModalFormSlider());
		},
		AddDrodown() {
			this.ModalFormContent.push(new ModalFormDropdown());
		},
		MoveModalModuleUp(Index) {
			MoveArray(this.ModalFormContent, Index, Index - 1)
		},
		MoveModalModuleDown(Index) {
			MoveArray(this.ModalFormContent, Index, Index + 1)
		},
		DeleteModalModule(Id) {
			this.ModalFormContent.splice(Id, 1);
		},
		AddDrodownOption(Component) {
			Component.Options.push("Example");
		},
		MoveSelectionOptionUp(Component,Index) {
			MoveArray(Component.Options, Index, Index - 1)
		},
		MoveSelectionOptionDown(Component,Index) {
			MoveArray(Component.Options, Index, Index + 1)
		},
		DeleteSelectionOption(Component,Id) {
			Component.Options.splice(Id, 1);
		},
		GenerateActionForm() {
			this.GeneratedActionForm = `const form = new ActionFormData()\n.title("${this.ActionFormTitle}")`;
			if (this.ActionFormBody != "")
				this.GeneratedActionForm += `\n.body("${this.ActionFormBody}")`;
			this.ActionFormButtons.forEach(button => {
				if (button.ImagePath != "")
					this.GeneratedActionForm += `\n.button("${button.Title}","${button.ImagePath}")`;
				else
					this.GeneratedActionForm += `\n.button("${button.Title}")`;
			});
			this.GeneratedActionForm += ";";
		},
		GenerateMessageForm() {
			this.GeneratedMessageForm = `const form = new MessageFormData()\n.title("${this.MessageFormTitle}")`;
			if (this.MessageFormBody != "")
				this.GeneratedMessageForm += `\n.body("${this.MessageFormBody}")`;
			this.GeneratedMessageForm += `\n.button1("${this.MessageFormBTN1}")`;
			this.GeneratedMessageForm += `\n.button2("${this.MessageFormBTN2}")`;
			this.GeneratedMessageForm += ";";
		},
		GenerateModalForm() {
			this.GeneratedModalForm = `const form = new ModalFormData()\n.title("${this.ModalFormTitle}")`;
			this.ModalFormContent.forEach(module => {
				if(module.Type == 'Textbox')
					this.GeneratedModalForm += `\n.textField("${module.Title}", "${module.Placeholder}", "${module.Default}")`;
				if(module.Type == 'Slider')
					this.GeneratedModalForm += `\n.slider("${module.Title}", ${module.Min}, ${module.Max}, ${module.Step}, ${module.Default})`;
				if(module.Type == 'Toggle')
					this.GeneratedModalForm += `\n.toggle("${module.Title}", ${module.Toggled})`;
				if(module.Type == 'Dropdown')
					this.GeneratedModalForm += `\n.dropdown("${module.Title}", ${stringify(module.Options)}, ${module.Default})`;
			});
			this.GeneratedModalForm += ";";
		},
		CopyActionFormOutput() {
			navigator.clipboard.writeText(this.GeneratedActionForm);
			var Toast = document.getElementById("Popup");
			Toast.style.animation = "PopupAnimation 2s";
			Toast.addEventListener("animationend", (ev) => {
				ev.target.style.animation = "";
				Toast.removeEventListener("animationend", (ev) => { });
			});
		},
		CopyMessageFormOutput() {
			navigator.clipboard.writeText(this.GeneratedMessageForm);
			var Toast = document.getElementById("Popup");
			Toast.style.animation = "PopupAnimation 2s";
			Toast.addEventListener("animationend", (ev) => {
				ev.target.style.animation = "";
				Toast.removeEventListener("animationend", (ev) => { });
			});
		},
		CopyModalFormOutput() {
			navigator.clipboard.writeText(this.GeneratedModalForm);
			var Toast = document.getElementById("Popup");
			Toast.style.animation = "PopupAnimation 2s";
			Toast.addEventListener("animationend", (ev) => {
				ev.target.style.animation = "";
				Toast.removeEventListener("animationend", (ev) => { });
			});
		},
		ToggleOn(Component) {
			Component.Toggled = true;
		},
		ToggleOff(Component) {
			Component.Toggled = false;
		},
		ShowHideDropdown(Component)
		{
			if(Component.Selected)
				Component.Selected = false;
			else
				Component.Selected = true;
		},
		SetSelectionDefault(Component, Index) {
			Component.Default = Index;
		}
	}
}

function MoveArray(arr, fromIndex, toIndex) {
	var element = arr[fromIndex];
	arr.splice(fromIndex, 1);
	arr.splice(toIndex, 0, element);
}

class ActionFormButton {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Title = "Example";
		this.ImagePath = "";
		this.ImgValue;
	}
}

class ModalFormToggle {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Title = "Example";
		this.Toggled = false;
		this.Type = "Toggle";
	}
}

class ModalFormTextbox {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Title = "Example";
		this.Placeholder = "Example";
		this.Default = "Example";
		this.Type = "Textbox";
	}
}

class ModalFormSlider {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Title = "Example";
		this.Min = 0;
		this.Max = 10;
		this.Step = 1;
		this.Default = 0;
		this.Type = "Slider";
	}
}

class ModalFormDropdown {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Title = "Example";
		this.Options = [ "Default" ];
		this.Default = 0;
		this.Selected = false;
		this.Type = "Dropdown";
	}
}
</script>

<style>
.Output {
	background: var(--v-tabInactive-base);
	border-radius: 5px;
	padding: 5px;
}

.RTEditor {
	background: var(--v-tabInactive-base);
	border-radius: 5px;
	padding: 5px;
	margin-top: 5px;
}

.TitleButtonsGTGrid {
	display: grid;
	grid-template-columns: auto auto auto;
	column-gap: 20px;
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

.MCButton {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 4px;
	border-style: solid;
	-o-border-image: url(button_borderless_light.png) 1 1 1 1;
	-webkit-border-image: url(button_borderless_light.png) 1 1 1 1;
	-moz-border-image: url(button_borderless_light.png) 1 1 1 1;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtSURBVAhbY/j379//79+/g/GB/Qf+M4AYx44dA+PUlFQsAiBlIAYIR4ZH/gcAR6oyBr6zTCIAAAAASUVORK5CYII=") 1 1 1 1 fill;
	border-width: 2 2 2 2;
	image-rendering: pixelated;
}

.MCToggleOff {
	height: 30px;
	width: 60px;
	background-size: 60px 30px;
	margin-bottom: 4px;
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAAAXNSR0IArs4c6QAAAI9JREFUOI3llW0KwCAIhjV2Lzvi2InyTx6r/VmDPhytNhrsgaDEfNMiEQACNBBCwBY/DcR0uzmCqsN7P6KnssSJiFQdtnWLJ26qzAVJyovmlWOt7VZ0zhU20x1tkOaMaxBRsmbm94WJqBCq2TSmlfp/wt13zMxzHtddoZzvl7r2+wwLi8j5J2s83Z0QJrXFHdfaQUgTSSrJAAAAAElFTkSuQmCC");
	image-rendering: pixelated;
	background-color: transparent;
}

.MCToggleOff:hover {
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAAAXNSR0IArs4c6QAAAJRJREFUOI1j/P///38G4gAjkeqwa2ZE1c7CwMDAYHFdHqcGnlP/GPbEP6bETqyABdkCbODA5ScwJrEhgwugeJkFlyp0wJxAfkj/XYDpZiayTaMQEO1jbIBRBJX//w0dLGYUwbQImxguMGBBPfIsJjuO/78ZoMRFqkXoYPAHNbbSh2KLeU79Qy6TcQGKaicMwwaqWgQAeLwoOgfnwbEAAAAASUVORK5CYII=");
}

.MCToggleOn {
	height: 30px;
	width: 60px;
	background-size: 60px 30px;
	margin-bottom: 4px;
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABRSURBVDjLY/j//z8DNTEQ/CcK08JifODYsWPYLSbaxXgwzAJsOCIsArfF9fX1ZOPha7GDgwMYj1o8avHwsXh45eMBKTKpUUnALMCFaWYxMRgAabqrrJ4nx1gAAAAASUVORK5CYII=");
	image-rendering: pixelated;
	background-color: transparent;
}

.MCToggleOn:hover {
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAB8SURBVHjaYvz//z8DlQFRBrIw0ABYXJfHKcdz6h/DnvjHWC2mShDwnPqHVfzA5Se4fezfaU62hRvLTxKljolhgADZFm99dIph66NT9Ld4wHw8avGQsZjskstbzmwY+ZjY0ofaFjNSWjvxnPoHL5NxAcaBqhYBAAAA//8DAPraIgqZtiPEAAAAAElFTkSuQmCC");
}

.MCButton:hover {
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAHElEQVQImWMQP8sOQYrNbAwQCsTyY0DlQCkwAgAz5woarZ4QnQAAAABJRU5ErkJggg==") 1 1 1 1 fill;
}

.MCButton:active {
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAG0lEQVQIHWNg8GOAIMVmNigFROJn2VE5EAqCANuIChrqOY3qAAAAAElFTkSuQmCC") 1 1 1 1 fill;
}

.MCTextbox {
	font-family: Mojangles;
	outline: 0;
	background: transparent;
	margin-bottom: 4px;
	-o-border-image: url(text_edit_base.png) 3 3 4 3;
	-webkit-border-image: url(text_edit_base.png) 3 3 4 3;
	-moz-border-image: url(text_edit_base.png) 3 3 4 3;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAMklEQVQY02NgYGD4jw0DAYhgAIH/bi5uKBhDQVxcHAomXcGmTZtQMIYCvI6EMXBhggoAxAWL8SVT9zoAAAAASUVORK5CYII=") 3 3 4 3 fill;
	border-width: 8px 8px 8px 8px;
	border-style: outset;
	margin: 0;
	width: 102%;
	height: 60px;
	image-rendering: pixelated;
}

.MCTextbox:hover {
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAKUlEQVQY02P4jwMwwACI4+bihoIxFMTFxaFg0hVs2rQJBWMowOtIigEAlN10CcADxHMAAAAASUVORK5CYII=") 3 3 4 3 fill;
}

.MCSlider {
	margin-top: 5px;
	margin-bottom: 10px;
	-webkit-appearance: none;
	appearance: none;
	width: 100%;
	height: 20px;
	background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAIAAADZSiLoAAAAF0lEQVQI12N0cHBgYGBgYGBgYoABBAsAFXgAxulxJusAAAAASUVORK5CYII=");
	-o-border-image: url(slider_button_default.png) 1 1 1 1;
	-webkit-border-image: url(slider_button_default.png) 1 1 1 1;
	-moz-border-image: url(slider_button_default.png) 1 1 1 1;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWKLW/AAAAHklEQVQI103JoQEAIAAEIc79d36LQSptm+dAFfTPBbwhCAE7ZTfbAAAAAElFTkSuQmCC") 1 1 1 1 fill;
	border-width: 2px 2px 2px 2px;
	border-style: outset;
	image-rendering: pixelated;
}

.MCSlider::-webkit-slider-thumb {
	width: 18px;
	height: 34px;
	-webkit-appearance: none;
	appearance: none;
	-o-border-image: url(slider_button_default.png) 2 2 2 2;
	-webkit-border-image: url(slider_button_default.png) 2 2 2 2;
	-moz-border-image: url(slider_button_default.png) 2 2 2 2;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAAklEQVR4AewaftIAAAA9SURBVHXBUQ3AIBBEwUeDg9V13siZWjPngULSJv2gM03S5KCzVBUv20QEnYdtthzJdvGjs9gmR/LVJE0Obnq4EJNtGgRhAAAAAElFTkSuQmCC") 2 2 2 2 fill;
	border-width: 4px 4px 4px 4px;
	border-style: outset;
	image-rendering: pixelated;
}

.MCSlider::-webkit-slider-thumb:hover {
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABASURBVHjaYvz///9/BiyAhYGBgcHiujxcgOfUP4Y98Y8hEjABBgYGhgOXnzAwMDAwMDHgACww1TCVMMCIy3LAAOeLFZ+q6SOBAAAAAElFTkSuQmCC") 2 2 2 2 fill;
}

.MCDropdown {
	width: 100%;
	height: 60px;
	padding: 15px;
	margin-bottom: 4px;
	border-style: solid;
	-o-border-image: url(button_borderless_light.png) 1 1 1 1;
	-webkit-border-image: url(button_borderless_light.png) 1 1 1 1;
	-moz-border-image: url(button_borderless_light.png) 1 1 1 1;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtSURBVAhbY/j379//79+/g/GB/Qf+M4AYx44dA+PUlFQsAiBlIAYIR4ZH/gcAR6oyBr6zTCIAAAAASUVORK5CYII=") 1 1 1 1 fill;
	border-width: 2px 2px 2px 2px;
	image-rendering: pixelated;
}

.MCDropdown:hover {
	width: 100%;
	height: 60px;
	margin-bottom: 4px;
	border-style: solid;
	-o-border-image: url(button_borderless_light.png) 1 1 1 1;
	-webkit-border-image: url(button_borderless_light.png) 1 1 1 1;
	-moz-border-image: url(button_borderless_light.png) 1 1 1 1;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAHElEQVQImWMQP8sOQYrNbAwQCsTyY0DlQCkwAgAz5woarZ4QnQAAAABJRU5ErkJggg==") 1 1 1 1 fill;
	border-width: 2px 2px 2px 2px;
	image-rendering: pixelated;
}

.MCDropdownArrow {
	float: right;
	display: inline;
	width: 18px;
	height: 18px;
	background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABHSURBVHjatJFRCgAgCEOb59ttd8D1FRQV6UcDQeZTBsJ2yypaQSUYJNM5QhIyoCTEaF7gkvm2MPtxGxwP2N6KpE8+vj2lDwBTYjiEuOLJygAAAABJRU5ErkJggg==");
	image-rendering: pixelated;
	background-size: cover;
}

.MCDropdownArrowActive {
	float: right;
	display: inline;
	width: 18px;
	height: 18px;
	background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABESURBVChTY/z//z8DsYAJShMFsCr29fXFah2GYphCbBpQFKMrQOfDFeOyGlkcrBiXQhiAyTP6+PjgVYgM6BzO2AEDAwCFdBkHORCnVwAAAABJRU5ErkJggg==");
	image-rendering: pixelated;
	background-size: cover;
}

.MCDropdownContent {
	transform: translate(-15px, 15px);
	position: relative;
	z-index: 1;
	width: 100%;
	margin-bottom: 4px;
	border-style: solid;
	-o-border-image: url(button_borderless_light.png) 2 2 2 2;
	-webkit-border-image: url(button_borderless_light.png) 2 2 2 2;
	-moz-border-image: url(button_borderless_light.png) 2 2 2 2;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAvSURBVBhXY0ADjEDs5+MHJL18vDIyMpjAogzqmure3t4QNsOMGTMegwGUjwAMDAB8sQt2vmSbpAAAAABJRU5ErkJggg==") 2 2 2 2 fill;
	border-width: 4px 4px 4px 4px;
	image-rendering: pixelated;
}

.MCDropdownSelection {
	display: grid;
	grid-template-columns: auto auto;
	justify-content: start;
	background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQIHWPw8vACAAG8AN2dliNJAAAAAElFTkSuQmCC");
	column-gap: 10px;
}

.MCDropdownSelection:hover {
	display: grid;
	grid-template-columns: auto auto;
	justify-content: start;
	background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQIW2MQL2EAAAExAIz1syfxAAAAAElFTkSuQmCC");
}

.MCDropdownRadioButtonOff {
	width: 20px;
	height: 20px;
	border-style: solid;
	-o-border-image: url(button_borderless_light.png) 2 2 2 2;
	-webkit-border-image: url(button_borderless_light.png) 2 2 2 2;
	-moz-border-image: url(button_borderless_light.png) 2 2 2 2;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAcSURBVBjTY2BgYPhPJGb4HxEWgRePKiROITEYAMwJpR1N/yxLAAAAAElFTkSuQmCC") 2 2 2 2 fill;
	border-width: 4px 4px 4px 4px;
	image-rendering: pixelated;
}

.MCDropdownRadioButtonOff:hover {
	width: 20px;
	height: 20px;
	border-style: solid;
	-o-border-image: url(button_borderless_light.png) 2 2 2 2;
	-webkit-border-image: url(button_borderless_light.png) 2 2 2 2;
	-moz-border-image: url(button_borderless_light.png) 2 2 2 2;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAZSURBVBjTY/hPJGAAERFhEXjxqELiFBIDACxwEMBDO47PAAAAAElFTkSuQmCC") 2 2 2 2 fill;
	border-width: 4px 4px 4px 4px;
	image-rendering: pixelated;
}

.MCDropdownRadioButtonOn {
	width: 20px;
	height: 20px;
	border-style: solid;
	-o-border-image: url(button_borderless_light.png) 2 2 2 2;
	-webkit-border-image: url(button_borderless_light.png) 2 2 2 2;
	-moz-border-image: url(button_borderless_light.png) 2 2 2 2;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QAwgDCAMKN1+F2AAAAWElEQVQY062QSwrAIAwFx+K1cg3JEaXHcCfFM72uWgSlZNFZ5TMJIQkQATKAF/+U6lkBkBdXa007vLgA5Weq975sMrM3Pgjyv5jnZHfnIo5rLM25lqIPvwFOsSyHddI8QwAAAABJRU5ErkJggg==") 2 2 2 2 fill;
	border-width: 4px 4px 4px 4px;
	image-rendering: pixelated;
}

.MCDropdownRadioButtonOn:hover {
	width: 20px;
	height: 20px;
	border-style: solid;
	-o-border-image: url(button_borderless_light.png) 2 2 2 2;
	-webkit-border-image: url(button_borderless_light.png) 2 2 2 2;
	-moz-border-image: url(button_borderless_light.png) 2 2 2 2;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QAVQBVAFV4xrLkAAAAUklEQVQY062QMQrAMAwD5ZJvmTgvT8mWV12nlEJD8dCbZJCEkQEoQZGkFu3T1M8uAUQNxhjsiBoAlJWac76a3P3Wh5L8byzPY/fnwgAy81h28AuzuDocEyFV6wAAAABJRU5ErkJggg==") 2 2 2 2 fill;
	border-width: 4px 4px 4px 4px;
	image-rendering: pixelated;
}

.GTActionFormPreview {
	overflow: scroll;
	margin: auto;
	border-style: solid;
	padding: 5px;
	-o-border-image: url(dialog_background_hollow_3.png) 23 8 8 8;
	-webkit-border-image: url(dialog_background_hollow_3.png) 23 8 8 8;
	-moz-border-image: url(dialog_background_hollow_3.png) 23 8 8 8;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAhCAYAAADUIPtUAAAAAklEQVR4AewaftIAAAC9SURBVK3BwXGDMBCG0W//UJGacAU6qQwaSCrQhSsVqA+2LEUZx2P7EALMvme865xj/DKe+sAZZsZgDB/c9YGzbrcb67p+Al8G9IEHd+eoWis/WmuIF+7OVSKICCKCiCAiiAgigoggIogIIoKIICKICCKCiCAiyMSOeZ55SClRSuEv4h/ubu5uy7KwRwSZ2JFSYtu2zgETO0opuDtHiCAiiLio1sor467nnLmqtYbx1HPOnNVaYzDjXec8Y/gGSPg0olRZzQgAAAAASUVORK5CYII=") 23 8 8 8;
	border-width: 48px 18px 18px 18px;
	image-rendering: pixelated;
}

.GTMessageFormPreview {
	overflow: scroll;
	margin: auto;
	border-style: solid;
	-o-border-image: url(dialog_background_hollow_1.png) 23 8 76 8;
	-webkit-border-image: url(dialog_background_hollow_1.png) 23 8 76 8;
	-moz-border-image: url(dialog_background_hollow_1.png) 23 8 76 8;
	border-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAABlCAYAAABA6bMuAAAAAklEQVR4AewaftIAAAElSURBVK3BwXEaQQAAwdkxEZGEIuBFGCRgR8CHLxFcHmxY53PJKkkPY6Cme/DdynMGfw0+rRueMcZgM9j84N264Vlvb29cr9efwK8BrBs+zDl51Pl85o9lWZAv5py8SiISkYhEJCIRiUhEIhKRiEQkIhGJSEQiO+44nU582O/3HI9H/kX+Y8455pzjcrlwj0R23LHf77ndbisP2HHH8XhkzskjJCIRiUhEIhKRiEQkIhGJSEQiEpGIRCQiEYlIRCISkYhEJCIRiUhEIhKRiEQkIhGJSEQiEpGIRCQiEYlIRCISkYhEJCIRiUhEIhKRiEQkIhGJSEQiEpGIRCQiEYlIRCISkRedz2e+GrxbD4cDr1qWhcGn9XA48KxlWdiMwXcrzxtsfgOTLTUqhlgp7wAAAABJRU5ErkJggg==") 23 8 76 8;
	border-width: 48px 18px 168px 18px;
	image-rendering: pixelated;
}

.MCAFButtonDisplayer {
	display: grid;
	column-gap: 5px;
}

.ModalToggleDisplayer {
	display: grid;
	grid-template-columns: auto auto;
	column-gap: 5px;
	justify-content: start;
	width: 100%;
}

.GTModalAdders {
	display: grid;
	grid-template-columns: auto auto;
	column-gap: 5px;
	width: 100%;
}

@media (min-width: 100px) {
	.GTActionFormPreview {
		width: 300px;
		height: 300px;
	}

	.MCButton {
		height: 50px;
	}

	.MCAFButtonDisplayer {
		grid-template-columns: 50px auto;
	}

	.AFMCButtonIcon {
		height: 50px;
	}

	.GTMessageFormPreview {
		width: 350px;
		height: 330px;
	}

	.GTMSFButtons {
		width: 310px;
		transform: translateY(-150px);
	}
}

@media (min-width: 800px) {
	.GTActionFormPreview {
		width: 400px;
		height: 400px;
	}

	.MCButton {
		height: 60px;
	}

	.MCAFButtonDisplayer {
		grid-template-columns: 60px auto;
	}

	.AFMCButtonIcon {
		height: 60px;
	}

	.GTMessageFormPreview {
		width: 400px;
		height: 350px;
	}

	.GTMSFButtons {
		width: 360px;
		transform: translateY(-150px);
	}
}

.GTAF-flip-list-move {
	transition: transform 0.4s;
}

.GTAF-flip-list-enter-active,
.GTAF-flip-list-leave-active {
	transition: all 0.4s;
}

.GTAF-flip-list-enter,
.GTAF-flip-list-leave-to {
	opacity: 0;
	transform: translateX(30px);
}

pre {
	font-family: "Roboto", sans-serif;
	overflow-wrap: break-word;
	overflow: hidden;
}

@font-face {
	font-family: "Mojangles";
	src: url(data:font/truetype;charset=utf-8;base64,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AyAAAAMgAAABIAAAASAAAAKgAAADIAAAAqAAAAMgAAADoAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAACIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAACIAAAAyAAAAIgAAADIAAAAyAAAAGgAAADIAAAAyAAAAMgAAADIAAAAyAAAAKgAAADIAAAAyAAAAEgAAADIAAAAqAAAAGgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAiAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAKgAAABIAAAAqAAAAOgAAABIAAAAyAAAAEgAAAEoAAAAyAAAAMgAAABoAAAA6AAAAMgAAADoAAAAqAAAAGgAAAEIAAABKAAAAGgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAABoAAAAaAAAAMgAAACIAAAAyAAAAMgAAADIAAAAyAAAAMgAAACIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAGgAAABoAAAAyAAAAIgAAADIAAAAyAAAAMgAAADIAAAAyAAAAOgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADoAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAAAyAAAAMgAAADIAAABCAAAAMgAAADoAAAAyAAAAMgAAAEIAAABCAAAAOgAAADoAAAAyAAAAQgAAAEIAAABCAAAAMgAAADIAAAAaAAAAGgAAABIAAAAaAAAAKgAAACoAAAAqAAAAIgAAACIAAAAAEAAADPACgACgAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAiAZ4AAQAAAAAAAAAcAAAAAQAAAAAAAQAGABwAAQAAAAAAAgAHACIAAQAAAAAAAwARACkAAQAAAAAABAAOADoAAQAAAAAABQALAEgAAQAAAAAABgAGAFMAAQAAAAAABwA8AFkAAQAAAAAACAAVAJUAAQAAAAAACQANAKoAAQAAAAAACgAnALcAAQAAAAAACwAX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AP9yAKYAjwAA/3EApgCPAAD/cQCnAI0AAAAA/9f/1v/G/Y4DgAAA/IAAAAAAAgAAAAAAgAOAAAMABwAAAQEBAQEBAQEAAAAAAIAAAP+AAAAAgAAAAAAAgAAA/4ABAAKAAAD9gAAEAAACAAIAA4AAAwAHAAsADwAAAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAIAAAACAAAD/AAAAAIAAAACAAAAAgAAAAgAAgAAA/4AAAACAAAD/gACAAQAAAP8AAAABAAAA/wAAAgAAAAACgAOAAAMAHwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBgAAA/4AAAP+AAAD/gAAAAIAAAP+AAAAAgAAAAIAAAACAAAAAgAAAAIAAAP+AAAAAgAAA/4AAAP+AAAD/gAAAAYAAgAAA/4D+gAEAAAAAgAAAAIAAAACAAAABAAAA/wAAAAEAAAD/AAAA/4AAAP+AAAD/gAAA/wAAAAEAAAD/AAAFAAAAAAKAA4AABwALAA8AEwAbAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAP8AAAACAAAA/4AAAACAAAAAgAAA/gAAAAGAAAD+AAAAAIAAAAAAAAAAgAAAAIAAAAEAAAAAAACAAAAAgAAA/4AAAP+AAQAAgAAA/4AAgACAAAD/gACAAIAAAP+AAIAAgAAAAIAAAP+AAAD/gAAAAAcAAAAAAoADgAADAAcACwAPABMAFwAbAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAABgAAAAIAAAP4AAAAAgAAAAAAAAACAAAAAAAAAAIAAAP4AAAAAgAAAAYAAAACAAAAAAACAAAD/gAAAAQAAAP8AAIABAAAA/wABAACAAAD/gACAAQAAAP8AAIABAAAA/wAAgACAAAD/gAAAAAgAAAAAAoADgAADAAcACwAPABsAHwAjACcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAgAAAAQAAAACAAAAAgAAA/YAAAACAAAABgAAAAIAAAP8AAAD/gAAA/4AAAACAAAAAgAAAAIAAAP6AAAAAgAAAAIAAAACAAAD/AAAAAIAAAAAAAIAAAP+AAAAAgAAA/4AAgAEAAAD/AAEAAIAAAP+A/wAAgAAAAIAAAACAAAAAgAAA/wAAAP8AAgAAgAAA/4AAAACAAAD/gACAAIAAAP+AAAIAAAIAAQADgAADAAcAAAEBAQEBAQEBAAAAAACAAAAAAAAAAIAAAAIAAIAAAP+AAIABAAAA/wAABQAAAAACAAOAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAQAAAP6AAAAAgAAA/wAAAACAAAAAAAAAAIAAAAAAAAABAAAAAAAAgAAA/4AAgACAAAD/gACAAYAAAP6AAYAAgAAA/4AAgACAAAD/gAAAAAUAAAAAAgADgAADAAcACwAPABMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAEAAAAAAAAAAIAAAAAAAAAAgAAA/wAAAACAAAD+gAAAAQAAAAAAAIAAAP+AAIAAgAAA/4AAgAGAAAD+gAGAAIAAAP+AAIAAgAAA/4AAAAAFAAABAAIAAoAAAwAHAAsADwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAQAAAACAAAD+gAAAAQAAAP6AAAAAgAAAAQAAAACAAAABAACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAAAAAQAAAAACgAKAAAsAAAEBAQEBAQEBAQEBAQEAAAD/AAAAAQAAAACAAAABAAAA/wAAAAAAAQAAAACAAAABAAAA/wAAAP+AAAD/AAAAAAEAAP+AAIABAAADAAABAQEBAAAAAACAAAD/gAGAAAD+gAAAAAEAAAEAAoABgAADAAABAQEBAAAAAAKAAAABAACAAAD/gAAAAAEAAAAAAIABAAADAAABAQEBAAAAAACAAAAAAAEAAAD/AAAAAAUAAAAAAoADgAADAAcACwAPABMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAIAAAAAAAAAAgAAAAAAAAACAAAAAAAAAAIAAAAAAAIAAAP+AAIABAAAA/wABAACAAAD/gACAAQAAAP8AAQAAgAAA/4AAAAAFAAAAAAKAA4AAAwAHAA8AFwAbAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAD/AAAAAIAAAP6AAAAAgAAAAIAAAP+AAAABgAAA/4AAAACAAAAAgAAA/gAAAAGAAAAAAACAAAD/gAGAAIAAAP+A/wACgAAA/oAAAP+AAAD/gAAAAYAAAACAAAAAgAAA/YACgACAAAD/gAAAAAEAAAAAAoADgAALAAABAQEBAQEBAQEBAQEAAAAAAQAAAP+AAAAAgAAAAIAAAAEAAAAAAACAAAACAAAAAIAAAACAAAD9AAAA/4AAAAAGAAAAAAKAA4AABQAJAA0AEQAVABkAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAACAAAA/gAAAACAAAAAAAAAAQAAAP4AAAAAgAAAAYAAAACAAAD+AAAAAYAAAAAAAQAAAP+AAAD/gAEAAIAAAP+AAIAAgAAA/4ABAACAAAD/gP+AAQAAAP8AAQAAgAAA/4AAAAAHAAAAAAKAA4AAAwAHAAsADwATABcAGwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAABgAAA/gAAAACAAAABgAAAAIAAAP6AAAABAAAA/gAAAACAAAABgAAAAIAAAP4AAAABgAAAAAAAgAAA/4AAgACAAAD/gAAAAQAAAP8AAQAAgAAA/4ABAACAAAD/gP+AAQAAAP8AAQAAgAAA/4AAAAADAAAAAAKAA4AAAwAHABMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAACAAAAAAAAAAIAAAACAAAD+AAAAAIAAAAGAAAD/gAAAAQAAAAIAAIAAAP+AAIAAgAAA/4D9gAEAAAABAAAA/4AAAAGAAAAAgAAA/IAAAAADAAAAAAKAA4AAAwAHAA8AAAEBAQEBAQEBAQEBAQEBAQEAAAAAAgAAAAAAAAAAgAAA/YAAAAKAAAD+AAAAAYAAAAAAAIAAAP+AAIABgAAA/oABgAGAAAD/gAAA/4AAAP+AAAAABQAAAAACgAOAAAMABwAPABMAFwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAAAAAAAAIAAAP2AAAAAgAAAAYAAAP6AAAAAAAAAAIAAAAAAAAABAAAAAAAAgAAA/4AAgAEAAAD/AAAAAgAAAP+AAAD/gAAA/wACAACAAAD/gACAAIAAAP+AAAAAAwAAAAACgAOAAAMABwAPAAABAQEBAQEBAQEBAQEBAQEBAQAAAACAAAAAAAAAAIAAAAAAAAD+gAAA/4AAAAKAAAAAAAGAAAD+gAGAAIAAAP+AAIABAAAA/4AAAAEAAAD+gAAAAAcAAAAAAoADgAADAAcACwAPABMAFwAbAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAD+AAAAAIAAAAGAAAAAgAAA/gAAAAGAAAD+AAAAAIAAAAGAAAAAgAAA/gAAAAGAAAAAAACAAAD/gACAAQAAAP8AAAABAAAA/wABAACAAAD/gACAAQAAAP8AAAABAAAA/wABAACAAAD/gAAAAAUAAAAAAoADgAADAAcACwATABcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAABAAAAAAAAAACAAAD+AAAAAIAAAAGAAAD+gAAAAYAAAACAAAD+AAAAAYAAAAAAAIAAAP+AAIAAgAAA/4ABgAEAAAD/AP8AAIAAAACAAAABAAAA/gACAACAAAD/gAAAAAIAAAAAAIADAAADAAcAAAEBAQEBAQEBAAAAAACAAAD/gAAAAIAAAAAAAQAAAP8AAgABAAAA/wAAAgAA/4AAgAMAAAMABwAAAQEBAQEBAQEAAAAAAIAAAP+AAAAAgAAA/4ABgAAA/oACgAEAAAD/AAAHAAAAAAIAA4AAAwAHAAsADwATABcAGwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQGAAAAAgAAA/wAAAACAAAD/AAAAAIAAAP8AAAAAgAAAAAAAAACAAAAAAAAAAIAAAAAAAAAAgAAAAAAAgAAA/4AAgACAAAD/gACAAIAAAP+AAIAAgAAA/4AAgACAAAD/gACAAIAAAP+AAIAAgAAA/4AAAAACAAAAgAKAAoAAAwAHAAABAQEBAQEBAQAAAAACgAAA/YAAAAKAAAAAgACAAAD/gAGAAIAAAP+AAAcAAAAAAgADgAADAAcACwAPABMAFwAbAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAIAAAAAAAAAAgAAAAAAAAACAAAD/AAAAAIAAAP8AAAAAgAAA/wAAAACAAAAAAACAAAD/gACAAIAAAP+AAIAAgAAA/4AAgACAAAD/gACAAIAAAP+AAIAAgAAA/4AAgACAAAD/gAAAAAYAAAAAAoADgAADAAcACwAPABMAFwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAACAAAD/gAAAAIAAAAAAAAAAgAAA/gAAAACAAAABgAAAAIAAAP4AAAABgAAAAAAAgAAA/4ABAACAAAD/gACAAIAAAP+AAQAAgAAA/4D/gAEAAAD/AAEAAIAAAP+AAAQAAAAAAwADgAADAAcADwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAACgAAA/QAAAACAAAAAgAAAAQAAAACAAAAAgAAA/YAAAAIAAAAAAACAAAD/gACAAoAAAP2AAIABgAAA/wAAAAGAAAD+AAIAAIAAAP+AAAIAAAAAAoADgAALAA8AAAEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAGAAAAAgAAA/4AAAP6AAAAAAAAAAYAAAAAAAwAAAP+AAAAAgAAA/QAAAAIAAAD+AAMAAIAAAP+AAAMAAAAAAoADgAADAAcAEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQECAAAAAIAAAP+AAAAAgAAA/YAAAAIAAAD+gAAAAYAAAP6AAAABgAAAAIABgAAA/oACAACAAAD/gP2AA4AAAP+AAAD/gAAA/4AAAP6AAAD/gAAAAAUAAAAAAoADgAADAAcACwAPABMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAAAAAAAAIAAAP2AAAAAgAAAAYAAAACAAAD+AAAAAYAAAAAAAIAAAP+AAIAAgAAA/4AAAAKAAAD9gAIAAIAAAP+AAIAAgAAA/4AAAAACAAAAAAKAA4AAAwALAAABAQEBAQEBAQEBAQECAAAAAIAAAP2AAAACAAAA/oAAAAGAAAAAgAKAAAD9gP+AA4AAAP+AAAD9gAAA/4AAAQAAAAACgAOAAAsAAAEBAQEBAQEBAQEBAQAAAAACgAAA/gAAAAEAAAD/AAAAAgAAAAAAA4AAAP+AAAD/gAAA/4AAAP6AAAD/gAAAAAEAAAAAAoADgAAJAAABAQEBAQEBAQEBAAAAAAKAAAD+AAAAAQAAAP8AAAAAAAOAAAD/gAAA/4AAAP+AAAD+AAAEAAAAAAKAA4AAAwAJAA0AEQAAAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAAAAAAA/4AAAAEAAAD9gAAAAIAAAAAAAAACAAAAAAAAgAAA/4AAgAGAAAAAgAAA/gAAAAKAAAD9gAKAAIAAAP+AAAAAAQAAAAACgAOAAAsAAAEBAQEBAQEBAQEBAQAAAAAAgAAAAYAAAACAAAD/gAAA/oAAAAAAA4AAAP8AAAABAAAA/IAAAAIAAAD+AAAAAAEAAAAAAYADgAALAAABAQEBAQEBAQEBAQEAAAAAAIAAAP+AAAABgAAA/4AAAACAAAAAAACAAAACgAAAAIAAAP+AAAD9gAAA/4AAAAADAAAAAAKAA4AAAwAHAAsAAAEBAQEBAQEBAQEBAQCAAAABgAAA/gAAAACAAAABgAAAAIAAAAAAAIAAAP+AAIAAgAAA/4AAAAMAAAD9AAAAAAUAAAAAAoADgAADAAcACwATABcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQIAAAAAgAAA/wAAAACAAAD/gAAAAIAAAP4AAAAAgAAAAQAAAP8AAAABgAAAAIAAAAAAAYAAAP6AAYAAgAAA/4ABAACAAAD/gP2AA4AAAP8AAAD/gAAA/gADAACAAAD/gAAAAAEAAAAAAoADgAAFAAABAQEBAQEAAAAAAIAAAAIAAAAAAAOAAAD9AAAA/4AAAwAAAAACgAOAAAMACwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAgAAA/oAAAACAAAAAgAAA/4AAAAGAAAD/gAAAAIAAAACAAAACAACAAAD/gP4AA4AAAP+AAAD/gAAA/YAAAAKAAAAAgAAAAIAAAPyAAAAAAwAAAAACgAOAAAMACwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAgAAA/oAAAACAAAAAgAAA/4AAAAGAAAD/gAAAAIAAAACAAAACAACAAAD/gP4AA4AAAP+AAAD/gAAA/YAAAAGAAAAAgAAAAYAAAPyAAAAABAAAAAACgAOAAAMABwALAA8AAAEBAQEBAQEBAQEBAQEBAQEAgAAAAYAAAP4AAAAAgAAAAYAAAACAAAD+AAAAAYAAAAAAAIAAAP+AAIACgAAA/YAAAAKAAAD9gAKAAIAAAP+AAAIAAAAAAoADgAADAA0AAAEBAQEBAQEBAQEBAQEBAgAAAACAAAD9gAAAAgAAAP6AAAABgAAA/oAAAAKAAIAAAP+A/YADgAAA/4AAAP+AAAD/gAAA/gAAAAAGAAAAAAKAA4AAAwAHAAsADwATABcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAABAAAAAIAAAACAAAD/AAAAAIAAAP4AAAAAgAAAAYAAAACAAAD+AAAAAYAAAAAAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAAAoAAAP2AAIACAAAA/gACAACAAAD/gAADAAAAAAKAA4AAAwAHABEAAAEBAQEBAQEBAQEBAQEBAQEBAQIAAAAAgAAA/4AAAACAAAD9gAAAAgAAAP6AAAABgAAA/oAAAAAAAgAAAP4AAoAAgAAA/4D9gAOAAAD/gAAA/4AAAP+AAAD+AAAGAAAAAAKAA4AAAwAHAAsADwATABcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAABgAAA/gAAAACAAAABgAAAAIAAAP4AAAABgAAA/gAAAACAAAAAAAAAAgAAAAAAAIAAAP+AAIAAgAAA/4AAAAGAAAD+gAGAAIAAAP+AAIAAgAAA/4AAgACAAAD/gAABAAAAAAKAA4AABwAAAQEBAQEBAQEBAAAA/wAAAAKAAAD/AAAAAAADAAAAAIAAAP+AAAD9AAAAAAMAAAAAAoADgAADAAcACwAAAQEBAQEBAQEBAQEBAIAAAAGAAAD+AAAAAIAAAAGAAAAAgAAAAAAAgAAA/4AAgAMAAAD9AAAAAwAAAP0AAAAABQAAAAACgAOAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAIAAAP8AAAAAgAAAAIAAAACAAAD+AAAAAIAAAAGAAAAAgAAAAAAAgAAA/4AAgAEAAAD/AAAAAQAAAP8AAQACAAAA/gAAAAIAAAD+AAAAAAMAAAAAAoADgAADAAsAEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAIAAAP6AAAAAgAAAAIAAAP+AAAABgAAA/4AAAACAAAAAgAAAAQAAgAAA/4D/AAOAAAD9gAAA/4AAAP+AAAAAgAAAAIAAAAKAAAD8gAAAAAkAAAAAAoADgAADAAcACwAPABMAFwAbAB8AIwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAABgAAAAIAAAP4AAAAAgAAAAIAAAACAAAD/AAAAAIAAAP8AAAAAgAAAAIAAAACAAAD+AAAAAIAAAAGAAAAAgAAAAAABgAAA/oAAAAGAAAD+gAGAAIAAAP+AAAAAgAAA/4AAgACAAAD/gACAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAAAABQAAAAACgAOAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAIAAAP8AAAAAgAAAAIAAAACAAAD+AAAAAIAAAAGAAAAAgAAAAAACgAAA/YACgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAAACAAAD/gAAAAAUAAAAAAoADgAAFAAkADQARABcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAgAAAP4AAAAAgAAAAAAAAACAAAAAAAAAAIAAAAAAAAD+AAAAAoAAAAAAAQAAAP+AAAD/gAEAAIAAAP+AAIAAgAAA/4AAgACAAAD/gACAAIAAAACAAAD/AAAAAAEAAAAAAYADgAAHAAABAQEBAQEBAQAAAAABgAAA/wAAAAEAAAAAAAOAAAD/gAAA/YAAAP+AAAAABQAAAAACgAOAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQECAAAAAIAAAP8AAAAAgAAA/wAAAACAAAD/AAAAAIAAAP8AAAAAgAAAAAAAgAAA/4AAgAEAAAD/AAEAAIAAAP+AAIABAAAA/wABAACAAAD/gAAAAAEAAAAAAYADgAAHAAABAQEBAQEBAQAAAAABAAAA/wAAAAGAAAAAAACAAAACgAAAAIAAAPyAAAAABQAAAgACgAOAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAGAAAAAgAAA/gAAAACAAAAAgAAAAIAAAP8AAAAAgAAAAgAAgAAA/4AAAACAAAD/gACAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAAAAEAAP+AAoAAAAADAAABAQEBAAAAAAKAAAD/gACAAAD/gAAAAAIAAAIAAQADgAADAAcAAAEBAQEBAQEBAIAAAACAAAD/AAAAAIAAAAIAAIAAAP+AAIABAAAA/wAAAwAAAAACgAKAAAMADQARAAABAQEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAAAAAABgAAA/oAAAAGAAAAAgAAA/gAAAAGAAAAAgACAAAD/gP+AAIAAAACAAAAAgAAAAIAAAP4AAgAAgAAA/4AAAwAAAAACgAOAAAMABwARAAABAQEBAQEBAQEBAQEBAQEBAQECAAAAAIAAAP6AAAABAAAA/gAAAACAAAAAgAAA/4AAAAGAAAAAgAGAAAD+gAGAAIAAAP+A/gADgAAA/oAAAP+AAAD/AAAA/4AABQAAAAACgAKAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEAgAAAAYAAAAAAAAAAgAAA/YAAAACAAAABgAAAAIAAAP4AAAABgAAAAAAAgAAA/4AAgACAAAD/gAAAAYAAAP6AAQAAgAAA/4AAgACAAAD/gAAAAAMAAAAAAoADgAADAAcAEQAAAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAQAAAP8AAAABgAAA/4AAAACAAAAAgAAAAIABgAAA/oABgACAAAD/gP4AAIAAAAEAAAAAgAAAAYAAAPyAAAMAAAAAAoACgAADAA0AEQAAAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAIAAAD9gAAAAIAAAAGAAAAAgAAA/gAAAAAAAAABgAAAAAAAgAAA/4AAgAGAAAD/gAAAAIAAAP8AAAD/gAGAAIAAAP+AAAIAAAAAAgADgAALAA8AAAEBAQEBAQEBAQEBAQEBAQEAgAAA/4AAAACAAAAAgAAAAQAAAP8AAAAAAAAAAQAAAAAAAgAAAACAAAAAgAAA/4AAAP+AAAD+AAMAAIAAAP+AAAMAAP+AAoACgAADAAcAEQAAAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAIAAAD+AAAAAIAAAAGAAAD+gAAAAYAAAP6AAAACAAAA/4AAgAAA/4ABgAEAAAD/AP8AAIAAAACAAAABAAAAAIAAAP2AAAMAAAAAAoADgAADAAcADwAAAQEBAQEBAQEBAQEBAQEBAQIAAAAAgAAA/oAAAAEAAAD+AAAAAIAAAACAAAD/gAAAAAACAAAA/gACAACAAAD/gP4AA4AAAP6AAAD/gAAA/oAAAAACAAAAAACAA4AAAwAHAAABAQEBAQEBAQAAAAAAgAAA/4AAAACAAAAAAAKAAAD9gAMAAIAAAP+AAAQAAAAAAoADgAADAAcACwAPAAABAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAD+AAAAAIAAAAGAAAAAgAAA/4AAAACAAAAAAACAAAD/gACAAQAAAP8AAAACAAAA/gACgACAAAD/gAAFAAAAAAIAA4AAAwAHAAsADwAXAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBgAAAAIAAAP8AAAAAgAAA/4AAAACAAAAAAAAAAIAAAP4AAAAAgAAAAIAAAP+AAAAAAACAAAD/gACAAIAAAP+AAQAAgAAA/4AAgACAAAD/gP4AA4AAAP4AAAD/gAAA/wAAAAACAAAAAAEAA4AAAwAHAAABAQEBAQEBAQCAAAAAgAAA/wAAAACAAAAAAACAAAD/gACAAwAAAP0AAAQAAAAAAoACgAADAAcADQARAAABAQEBAQEBAQEBAQEBAQEBAQEBAAAAAIAAAACAAAAAgAAA/YAAAAEAAAD/gAAAAQAAAACAAAABAAEAAAD/AP8AAgAAAP4AAAACgAAA/4AAAP4AAgAAgAAA/4AAAAACAAAAAAKAAoAAAwAJAAABAQEBAQEBAQEBAgAAAACAAAD9gAAAAgAAAP6AAAAAAAIAAAD+AAAAAoAAAP+AAAD+AAAAAAQAAAAAAoACgAADAAcACwAPAAABAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAD+AAAAAIAAAAGAAAAAgAAA/gAAAAGAAAAAAACAAAD/gACAAYAAAP6AAAABgAAA/oABgACAAAD/gAADAAD/gAKAAoAAAwAPABMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAgAAAACAAAD9gAAAAIAAAACAAAD/gAAAAYAAAP6AAAAAgAAAAQAAAAEAAQAAAP8A/oADAAAA/4AAAP+AAAD/gAAA/4AAAP8AAoAAgAAA/4AAAAADAAD/gAKAAoAAAwAHABMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAQAAAACAAAD+gAAAAYAAAP+AAAAAgAAAAIAAAAEAAQAAAP8AAQAAgAAA/4D9gAEAAAAAgAAAAIAAAACAAAAAgAAA/QAAAAADAAAAAAKAAoAAAwALAA8AAAEBAQEBAQEBAQEBAQEBAQECAAAAAIAAAP2AAAAAgAAAAIAAAP+AAAAAgAAAAQAAAAGAAIAAAP+A/oACgAAA/4AAAP+AAAD+gAIAAIAAAP+AAAAABQAAAAACgAKAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAgAAAAAAAAAAgAAA/gAAAAGAAAD+AAAAAIAAAAAAAAACAAAAAAAAgAAA/4AAgACAAAD/gACAAIAAAP+AAIAAgAAA/4AAgACAAAD/gAAAAAIAAAAAAYADgAADAA8AAAEBAQEBAQEBAQEBAQEBAQEBAAAAAIAAAP8AAAD/gAAAAIAAAACAAAAAgAAA/4AAAAAAAIAAAP+AAIACAAAAAIAAAACAAAD/gAAA/4AAAP4AAAIAAAAAAoACgAADAAkAAAEBAQEBAQEBAQEAAAAAAIAAAAAAAAABgAAAAIAAAACAAgAAAP4A/4AAgAAAAgAAAP2AAAAABQAAAAACgAKAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAIAAAP8AAAAAgAAAAIAAAACAAAD+AAAAAIAAAAGAAAAAgAAAAAAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAIABgAAA/oAAAAGAAAD+gAAAAAIAAAAAAoACgAADAA0AAAEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAIAAAACAAAAAgAAAAIAAAACAAgAAAP4A/4AAgAAAAQAAAP8AAAACAAAA/YAAAAAJAAAAAAKAAoAAAwAHAAsADwATABcAGwAfACMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAYAAAACAAAD+AAAAAIAAAACAAAAAgAAA/wAAAACAAAD/AAAAAIAAAACAAAAAgAAA/gAAAACAAAABgAAAAIAAAAAAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAAACAAAD/gAAAAAMAAP+AAoACgAADAAcADwAAAQEBAQEBAQEBAQEBAQEBAQAAAAACAAAA/gAAAACAAAABgAAA/oAAAAGAAAAAgAAA/4AAgAAA/4ABgAGAAAD+gP8AAIAAAACAAAABgAAA/YAAAAADAAAAAAKAAoAABwALABMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAgAAAAYAAAP6AAAAAgAAAAAAAAP6AAAACgAAA/4AAAAAAAIAAAACAAAD/gAAA/4ABAACAAAD/gACAAIAAAACAAAD/gAAA/4AAAAAFAAAAAAIAA4AAAwAHAAsADwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAABAAAA/oAAAACAAAD/AAAAAIAAAAAAAAAAgAAAAAAAAAEAAAAAAACAAAD/gACAAQAAAP8AAQAAgAAA/4AAgAEAAAD/AAEAAIAAAP+AAAAAAgAAAAAAgAOAAAMABwAAAQEBAQEBAQEAAAAAAIAAAP+AAAAAgAAAAAABgAAA/oACAAGAAAD+gAAFAAAAAAIAA4AAAwAHAAsADwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAABAAAAAAAAAACAAAAAAAAAAIAAAP8AAAAAgAAA/oAAAAEAAAAAAACAAAD/gACAAQAAAP8AAQAAgAAA/4AAgAEAAAD/AAEAAIAAAP+AAAAABAAAAoADAAOAAAMABwALAA8AAAEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAEAAAABAAAA/gAAAAEAAAABAAAAAIAAAAKAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAAIAAAAAAIADAAADAAcAAAEBAQEBAQEBAAAAAACAAAD/gAAAAIAAAAAAAgAAAP4AAoAAgAAA/4AAAwAAAAACgAOAAA8AEwAXAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAP+AAAAAgAAAAIAAAAEAAAD/AAAAAYAAAP+AAAAAgAAA/oAAAAEAAAAAAACAAAABAAAAAIAAAAEAAAD/AAAA/4AAAP8AAAD/gAKAAIAAAP+AAIAAgAAA/4AAAAACAAAAAACAA4AAAwAHAAABAQEBAQEBAQAAAAAAgAAA/4AAAACAAAAAAAGAAAD+gAIAAYAAAP6AAAIAAP+ABAADgAADACcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQECAAAA/4AAAP8AAAD/gAAAAQAAAAEAAAD/AAAA/4AAAACAAAD/gAAAAIAAAAKAAAAAgAAA/wAAAP6AAAABAAAAAIAAAP+AAAAAgAAA/4AAAAEAAQAAAP8A/oAAgAAAAIAAAP+AAAAAgAAAAIAAAAEAAAAAgAAAAIAAAACAAAD/gAAA/4AAAACAAAD/gAAA/4AAAP8AAAD/gAAA/4AAAP+AAAoAAACAAoADAAADAAcACwAPABMAFwAbAB8AIwAnAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAACAAAAAgAAAAIAAAP4AAAAAgAAAAIAAAACAAAD+AAAAAIAAAACAAAAAgAAA/wAAAACAAAAAgAAAAIAAAP8AAAAAgAAAAIAAAACAAAAAgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAAACAAAD/gACAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAAACAAAD/gAABAAAAgAKAAgAABQAAAQEBAQEBAgAAAP4AAAACgAAAAIABAAAAAIAAAP6AAAEAAAEAAQABgAADAAABAQEBAAAAAAEAAAABAACAAAD/gAAAAAMAAAAAAwACgAANABEAGwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAD/gAAAAIAAAACAAAAAgAAAAIAAAACAAAAAAAAAAIAAAP4AAAD/gAAAAgAAAP+AAAD/gAAAAAAAgAAAAYAAAP8AAAD/gAAAAIAAAP+AAAD/gACAAYAAAP6AAIABAAAAAIAAAP+AAAD/gAAA/4AAAAACAAABgAKAA4AAAwAPAAABAQEBAQEBAQEBAQEBAQEBAYAAAP+AAAD/gAAA/4AAAACAAAABgAAAAIAAAP+AAAACAAEAAAD/AP+AAIAAAAEAAAAAgAAA/4AAAP8AAAD/gAACAAAAAAMAA4AAAwAPAAABAQEBAQEBAQEBAQEBAQEBAAAAAAMAAAD+AAAA/wAAAAEAAAABAAAAAQAAAP8AAAAAAACAAAD/gAEAAQAAAACAAAABAAAA/wAAAP+AAAD/AAABAAABAAIAA4AAEQAAAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAgAAA/wAAAAGAAAAAgAAA/4AAAP+AAAABAAAAAQABAAAAAIAAAACAAAAAgAAA/4AAAP+AAAD/gAAA/4AAAP+AAAIAAAIAAQADgAADAAcAAAEBAQEBAQEBAAAAAACAAAAAAAAAAIAAAAIAAIAAAP+AAIABAAAA/wAAAQAAAAADgAOAAA8AAAEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAEAAAABAAAAAQAAAP+AAAD+gAAA/4AAAAAAAIAAAAMAAAD+AAAAAgAAAP4AAAD/gAAA/4AAAP+AAAAAAgAAAAAEAAOAAAMAEQAAAQEBAQEBAQEBAQEBAQEBAQEBAYAAAP+AAAAAgAAA/wAAAP+AAAAAgAAAA4AAAP8AAAD/gAAAAgABAAAA/wD+AAGAAAAAgAAAAQAAAACAAAD8gAAAAwAAAP0AAAAAAQAAAQABAAIAAAMAAAEBAQEAAAAAAQAAAAEAAQAAAP8AAAAACgAAAIACgAMAAAMABwALAA8AEwAXABsAHwAjACcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAACAAAAAgAAA/wAAAACAAAAAgAAAAIAAAP8AAAAAgAAAAIAAAACAAAD+AAAAAIAAAACAAAAAgAAA/gAAAACAAAAAgAAAAIAAAACAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAAACAAAD/gACAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAAcAAAAAAoADgAADAAcADQARABUAGQAdAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAAAAAAAgAAAAQAAAP+AAAABAAAA/oAAAACAAAAAAAAAAIAAAP4AAAAAgAAAAYAAAACAAAAAAACAAAD/gACAAQAAAP8A/4AAgAAAAQAAAP6AAYAAgAAA/4AAgAEAAAD/AACAAQAAAP8AAIAAgAAA/4AACAAAAAACgAOAAAMACQANABEAFQAZAB0AIQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAQAAAACAAAAAgAAA/gAAAACAAAABAAAAAIAAAP6AAAAAgAAAAAAAAACAAAD+AAAAAIAAAAGAAAAAgAAAAAAAgAAA/4AAAAEAAAD/gAAA/4AAgAEAAAD/AACAAIAAAP+AAIAAgAAA/4AAgAEAAAD/AACAAQAAAP8AAIAAgAAA/4AAAAAGAAAAAAKAA4AAAwAHAAsADwATABcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAABgAAAAAAAAACAAAD9gAAAAIAAAAAAAAAAgAAAAAAAAACAAAD/gAAAAIAAAAAAAIAAAP+AAIAAgAAA/4AAAAEAAAD/AAEAAIAAAP+AAIAAgAAA/4ABAACAAAD/gAAEAAAAAAKAA4AAAwANABEAFQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAAAAAAGAAAD+gAAAAYAAAACAAAD+AAAAAYAAAP4AAAABAAAAAIAAgAAA/4D/gACAAAAAgAAAAIAAAACAAAD+AAIAAIAAAP+AAQAAgAAA/4AAAAAEAAAAAAKAA4AAAwANABEAFQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAAAAAAGAAAD+gAAAAYAAAACAAAD+AAAAAYAAAP+AAAABAAAAAIAAgAAA/4D/gACAAAAAgAAAAIAAAACAAAD+AAIAAIAAAP+AAQAAgAAA/4AAAAAGAAAAAAKAA4AAAwANABEAFQAZAB0AAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAAAAAAGAAAD+gAAAAYAAAACAAAD+AAAAAYAAAP4AAAAAgAAAAYAAAACAAAD+AAAAAYAAAACAAIAAAP+A/4AAgAAAAIAAAACAAAAAgAAA/gACAACAAAD/gACAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAAAAQAAAAAAoADgAALAA8AEwAXAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAGAAAAAgAAA/4AAAP6AAAAAAAAAAYAAAP4AAAAAgAAAAYAAAACAAAAAAAKAAAD/gAAAAIAAAP2AAAABgAAA/oACgACAAAD/gACAAIAAAP+AAAAAgAAA/4AAAwAAAAACgAOAAAsADwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAYAAAACAAAD/gAAA/oAAAAAAAAABgAAA/wAAAACAAAAAAAIAAAD/gAAAAIAAAP4AAAABAAAA/wACAACAAAD/gAEAAIAAAP+AAAAAAQAAAAACgAOAABUAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAACAAAD/gAAAAgAAAP8AAAAAgAAA/4AAAAEAAAD+gAAA/4AAAAAAAwAAAP+AAAAAgAAAAIAAAP+AAAD/gAAA/4AAAP6AAAD/gAAAAgAAAP4AAAcAAP+AAoADgAADAAcACwAPABMAFwAbAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAEAAAAAAAAAAIAAAP4AAAABgAAAAAAAAACAAAD9gAAAAIAAAAGAAAAAgAAA/gAAAAGAAAD/gACAAAD/gACAAIAAAP+AAIAAgAAA/4AAgACAAAD/gAAAAgAAAP4AAYAAgAAA/4AAgACAAAD/gAAAAAQAAAAAAoADgAADAA0AEQAVAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAIAAAD9gAAAAIAAAAGAAAAAgAAA/gAAAAAAAAABgAAA/gAAAAEAAAAAAACAAAD/gACAAYAAAP+AAAAAgAAA/wAAAP+AAYAAgAAA/4ABAACAAAD/gAAAAAIAAAAAAoADgAALAA8AAAEBAQEBAQEBAQEBAQEBAQEAAAAAAoAAAP4AAAABAAAA/wAAAAIAAAD/AAAAAQAAAAAAAoAAAP+AAAD/gAAA/4AAAP+AAAD/gAMAAIAAAP+AAAYAAAAAAoADgAADAA0AEQAVABkAHQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAIAAAD9gAAAAIAAAAGAAAAAgAAA/gAAAAAAAAABgAAA/gAAAACAAAABgAAAAIAAAP4AAAABgAAAAAAAgAAA/4AAgAGAAAD/gAAAAIAAAP8AAAD/gAGAAIAAAP+AAIAAgAAA/4AAAACAAAD/gACAAIAAAP+AAAAABQAAAAACgAOAAAMADQARABUAGQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAgAAAAgAAAP2AAAAAgAAAAYAAAACAAAD+AAAAAAAAAAGAAAD+gAAAAIAAAACAAAAAgAAAAAAAgAAA/4AAgAGAAAD/gAAAAIAAAP8AAAD/gAGAAIAAAP+AAQAAgAAA/4AAAACAAAD/gAACAAAAAAEAA4AAAwAHAAABAQEBAQEBAQCAAAAAgAAA/wAAAAEAAAAAAAKAAAD9gAMAAIAAAP+AAAIAAAAAAQADgAADAAcAAAEBAQEBAQEBAAAAAACAAAD/gAAAAQAAAAAAAoAAAP2AAwAAgAAA/4AABAAAAAACgAOAAAMABwALAA8AAAEBAQEBAQEBAQEBAQEBAQEBAAAAAIAAAP6AAAAAgAAAAYAAAACAAAD+AAAAAYAAAAAAAoAAAP2AAoAAgAAA/4AAAACAAAD/gACAAIAAAP+AAAMAAAAAAYADgAADAAcACwAAAQEBAQEBAQEBAQEBAIAAAACAAAD/AAAAAIAAAACAAAAAgAAAAAACgAAA/YADAACAAAD/gAAAAIAAAP+AAAAABAAAAAACgAOAAAMACwATABcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAgAAA/oAAAACAAAAAgAAA/4AAAAGAAAD/gAAAAIAAAACAAAD9gAAAAoAAAAEAAIAAAP+A/wACgAAA/4AAAP+AAAD+gAAAAIAAAACAAAABgAAA/YADAACAAAD/gAAFAAAAAAKAA4AAAwAHAAsADwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAABgAAA/gAAAACAAAABgAAAAIAAAP4AAAABgAAA/gAAAAEAAAAAAACAAAD/gACAAYAAAP6AAAABgAAA/oABgACAAAD/gAEAAIAAAP+AAAAABQAAAAACgAOAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEAgAAAAYAAAP4AAAAAgAAAAYAAAACAAAD+AAAAAYAAAP+AAAABAAAAAAAAgAAA/4AAgAGAAAD+gAAAAYAAAP6AAYAAgAAA/4ABAACAAAD/gAAAAAcAAAAAAoADgAADAAcACwAPABMAFwAbAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAD+AAAAAIAAAAGAAAAAgAAA/gAAAAGAAAD+AAAAAIAAAAGAAAAAgAAA/gAAAAGAAAAAAACAAAD/gACAAYAAAP6AAAABgAAA/oABgACAAAD/gACAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAAAAYAAAAAAoADgAADAAcACwAPABMAFwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAD+AAAAAIAAAAGAAAAAgAAA/gAAAAGAAAD+AAAAAIAAAAGAAAAAgAAAAAAAgAAA/4AAgAIAAAD+AAAAAgAAAP4AAgAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAAUAAAEAAYACgAADAAcACwAPABMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAgAAAAIAAAP8AAAAAgAAA/wAAAACAAAAAgAAAAIAAAAEAAIAAAP+AAAAAgAAA/4AAgACAAAD/gACAAIAAAP+AAAAAgAAA/4AAAAAFAAAAAAKAA4AAAwAHAA8AFwAbAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAD/AAAAAIAAAP6AAAAAgAAAAIAAAP+AAAABgAAA/4AAAACAAAAAgAAA/gAAAAGAAAAAAACAAAD/gAGAAIAAAP+A/wACgAAA/oAAAP+AAAD/gAAAAYAAAACAAAAAgAAA/YACgACAAAD/gAAAAAMAAAAAAoADgAADAAkADQAAAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAAAAAABgAAAAIAAAP2AAAABAAAAAIACAAAA/gD/gACAAAACAAAA/YADAACAAAD/gAADAAAAAAKAA4AAAwAJAA0AAAEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAYAAAACAAAD/AAAAAQAAAACAAgAAAP4A/4AAgAAAAgAAAP2AAwAAgAAA/4AABQAAAAACgAOAAAMACQANABEAFQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAAAAAAGAAAAAgAAA/YAAAACAAAABgAAAAIAAAP4AAAABgAAAAIABgAAA/oD/gACAAAABgAAA/gACgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AABQAAAAACgAOAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEAgAAAAYAAAP4AAAAAgAAAAYAAAACAAAD9gAAAAIAAAAGAAAAAgAAAAAAAgAAA/4AAgAIAAAD+AAAAAgAAAP4AAoAAgAAA/4AAAACAAAD/gAAAAAQAAAAAAoADgAADAA0AEQAVAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAYAAAP6AAAABgAAAAIAAAP4AAAABgAAA/gAAAAEAAAAAgACAAAD/gP+AAIAAAACAAAAAgAAAAIAAAP4AAgAAgAAA/4ABAACAAAD/gAAAAAQAAAAAAoADgAADAA0AEQAVAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAYAAAP6AAAABgAAAAIAAAP4AAAABgAAA/4AAAAEAAAAAgACAAAD/gP+AAIAAAACAAAAAgAAAAIAAAP4AAgAAgAAA/4ABAACAAAD/gAAAAAYAAAAAAoADgAADAA0AEQAVABkAHQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAYAAAP6AAAABgAAAAIAAAP4AAAABgAAA/gAAAACAAAABgAAAAIAAAP4AAAABgAAAAIAAgAAA/4D/gACAAAAAgAAAAIAAAACAAAD+AAIAAIAAAP+AAIAAgAAA/4AAAACAAAD/gACAAIAAAP+AAAAABQAAAAACgAOAAAMADQARABUAGQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAAAAAABgAAA/oAAAAGAAAAAgAAA/gAAAAGAAAD+gAAAAIAAAACAAAAAgAAAAIAAgAAA/4D/gACAAAAAgAAAAIAAAACAAAD+AAIAAIAAAP+AAQAAgAAA/4AAAACAAAD/gAAEAAAAAAKAA4AAAwANABEAFQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAAAAAAGAAAD+gAAAAYAAAACAAAD+AAAAAYAAAP8AAAAAgAAAAIAAgAAA/4D/gACAAAAAgAAAAIAAAACAAAD+AAIAAIAAAP+AAQAAgAAA/4AAAAAEAAAAAAKAAoAAAwAVABkAHQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAIAAAP+AAAAAgAAAAIAAAACAAAAAgAAA/wAAAAEAAAD+AAAAAIAAAACAAAAAgAAAAIAAgAAA/4D/gACAAAAAgAAAAIAAAACAAAD/gAAAAIAAAP8AAAD/gAAA/4ACAACAAAD/gAAAAIAAAP+AAAAABwAA/4ACgAMAAAMABwALAA8AEwAXABsAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAQAAAAAAAAAAgAAA/gAAAAGAAAAAAAAAAIAAAP2AAAAAgAAAAYAAAACAAAD+AAAAAYAAAP+AAIAAAP+AAIAAgAAA/4AAgACAAAD/gACAAIAAAP+AAAABgAAA/oABAACAAAD/gACAAIAAAP+AAAAABAAAAAACgAOAAAMADQARABUAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAgAAAAgAAAP2AAAAAgAAAAYAAAACAAAD+AAAAAAAAAAGAAAD+AAAAAQAAAAAAAIAAAP+AAIABgAAA/4AAAACAAAD/AAAA/4ABgACAAAD/gAEAAIAAAP+AAAAABAAAAAACgAOAAAMADQARABUAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAgAAAAgAAAP2AAAAAgAAAAYAAAACAAAD+AAAAAAAAAAGAAAD/gAAAAQAAAAAAAIAAAP+AAIABgAAA/4AAAACAAAD/AAAA/4ABgACAAAD/gAEAAIAAAP+AAAAABgAAAAACgAOAAAMADQARABUAGQAdAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAgAAAAgAAAP2AAAAAgAAAAYAAAACAAAD+AAAAAAAAAAGAAAD+AAAAAIAAAAGAAAAAgAAA/gAAAAGAAAAAAACAAAD/gACAAYAAAP+AAAAAgAAA/wAAAP+AAYAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAAAAFAAAAAAKAA4AAAwANABEAFQAZAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAACAAAA/YAAAACAAAABgAAAAIAAAP4AAAAAAAAAAYAAAP6AAAAAgAAAAIAAAACAAAAAAACAAAD/gACAAYAAAP+AAAAAgAAA/wAAAP+AAYAAgAAA/4ABAACAAAD/gAAAAIAAAP+AAAIAAAAAAQADgAADAAcAAAEBAQEBAQEBAIAAAACAAAD/AAAAAQAAAAAAAoAAAP2AAwAAgAAA/4AAAgAAAAABAAOAAAMABwAAAQEBAQEBAQEAAAAAAIAAAP+AAAABAAAAAAACgAAA/YADAACAAAD/gAAEAAAAAAKAA4AAAwAHAAsADwAAAQEBAQEBAQEBAQEBAQEBAQEAAAAAgAAA/oAAAACAAAABgAAAAIAAAP4AAAABgAAAAAACgAAA/YACgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAAwAAAAABgAOAAAMABwALAAABAQEBAQEBAQEBAQEAgAAAAIAAAP8AAAAAgAAAAIAAAACAAAAAAAKAAAD9gAMAAIAAAP+AAAAAgAAA/4AAAAADAAAAAAKAA4AAAwAJAA0AAAEBAQEBAQEBAQEBAQEBAgAAAACAAAD9gAAAAgAAAP6AAAD/gAAAAoAAAAAAAgAAAP4AAAACgAAA/4AAAP4AAwAAgAAA/4AABQAAAAACgAOAAAMABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEAgAAAAYAAAP4AAAAAgAAAAYAAAACAAAD+AAAAAYAAAP4AAAABAAAAAAAAgAAA/4AAgAGAAAD+gAAAAYAAAP6AAYAAgAAA/4ABAACAAAD/gAAAAAUAAAAAAoADgAADAAcACwAPABMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAIAAAAGAAAD+AAAAAIAAAAGAAAAAgAAA/gAAAAGAAAD/gAAAAQAAAAAAAIAAAP+AAIABgAAA/oAAAAGAAAD+gAGAAIAAAP+AAQAAgAAA/4AAAAAHAAAAAAKAA4AAAwAHAAsADwATABcAGwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAABgAAA/gAAAACAAAABgAAAAIAAAP4AAAABgAAA/gAAAACAAAABgAAAAIAAAP4AAAABgAAAAAAAgAAA/4AAgAGAAAD+gAAAAYAAAP6AAYAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAAAAGAAAAAAKAA4AAAwAHAAsADwATABcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAABgAAA/gAAAACAAAABgAAAAIAAAP4AAAABgAAA/oAAAACAAAAAgAAAAIAAAAAAAIAAAP+AAIABgAAA/oAAAAGAAAD+gAGAAIAAAP+AAQAAgAAA/4AAAACAAAD/gAADAAAAAAMAA4AAAwAHAAsAAAEBAQEBAQEBAQEBAQEAAAABAAAA/gAAAAMAAAD+AAAAAQAAAAAAAQAAAP8AAYAAgAAA/4ABAAEAAAD/AAAAAAMAAAAAAoACgAADAA0AFwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAACAAAD/AAAA/4AAAACAAAAAgAAAAQAAAAAAAAD/gAAA/wAAAAGAAAAAgAAAAQAAgAAA/4D/AACAAAABgAAA/wAAAP+AAAD/gACAAQAAAACAAAAAgAAA/4AAAP6AAAAAAwAAAAACgAOAAAMACQANAAABAQEBAQEBAQEBAQEBAQAAAAAAgAAAAAAAAAGAAAAAgAAA/YAAAAEAAAAAgAIAAAD+AP+AAIAAAAIAAAD9gAMAAIAAAP+AAAMAAAAAAoADgAADAAkADQAAAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAAAAAABgAAAAIAAAP8AAAABAAAAAIACAAAA/gD/gACAAAACAAAA/YADAACAAAD/gAAFAAAAAAKAA4AAAwAJAA0AEQAVAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAAAAAAYAAAACAAAD9gAAAAIAAAAGAAAAAgAAA/gAAAAGAAAAAgAGAAAD+gP+AAIAAAAGAAAD+AAKAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAAFAAAAAAKAA4AAAwAHAAsADwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQCAAAABgAAA/gAAAACAAAABgAAAAIAAAP2AAAAAgAAAAYAAAACAAAAAAACAAAD/gACAAgAAAP4AAAACAAAA/gACgACAAAD/gAAAAIAAAP+AAAAABQAA/4ACgAOAAAMABwAPABMAFwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAIAAAD+AAAAAIAAAAGAAAD+gAAAAYAAAACAAAD+AAAAAIAAAACAAAAAgAAA/4AAgAAA/4ABgAGAAAD+gP8AAIAAAACAAAABgAAA/YADAACAAAD/gAAAAIAAAP+AAAAABQAA/4ACgAOAAAMABwAPABMAFwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAIAAAD+AAAAAIAAAAGAAAD+gAAAAYAAAACAAAD+AAAAAIAAAACAAAAAgAAA/4AAgAAA/4ABgAGAAAD+gP8AAIAAAACAAAABgAAA/YADAACAAAD/gAAAAIAAAP+AAAAAAgAAAAACgAOAAAsADwAAAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAYAAAACAAAD/gAAA/oAAAAAAAAABgAAAAAADAAAA/4AAAACAAAD9AAAAAgAAAP4AAwAAgAAA/4AAAwAAAAACgAOAAAMABwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQIAAAAAgAAA/4AAAACAAAD9gAAAAgAAAP6AAAABgAAA/oAAAAGAAAAAgAGAAAD+gAIAAIAAAP+A/YADgAAA/4AAAP+AAAD/gAAA/oAAAP+AAAAAAQAAAAADAAMAAAcAAAEBAQEBAQEBAAAAAAMAAAD/AAAA/wAAAAAAAwAAAP8AAAAAgAAA/YAAAAAEAAAAAAKAAoAABwALAA8AEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAAGAAAAAgAAA/gAAAACAAAAAgAAAAIAAAP8AAAAAgAAAAAABgAAA/wAAAAEAAAD+gAGAAIAAAP+AAAAAgAAA/4AAgACAAAD/gAABAAAAAAKAA4AACwAAAQEBAQEBAQEBAQEBAAAAAAKAAAD+AAAAAQAAAP8AAAACAAAAAAADgAAA/4AAAP+AAAD/gAAA/oAAAP+AAAAABQAAAAACgAOAAAUACQANABEAFwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAACAAAACAAAA/gAAAACAAAAAAAAAAIAAAAAAAAAAgAAAAAAAAP4AAAACgAAAAAABAAAA/4AAAP+AAQAAgAAA/4AAgACAAAD/gACAAIAAAP+AAIAAgAAAAIAAAP8AAAAAAQAAAAACgAOAAAsAAAEBAQEBAQEBAQEBAQAAAAAAgAAAAYAAAACAAAD/gAAA/oAAAAAAA4AAAP8AAAABAAAA/IAAAAIAAAD+AAAAAAUAAAAAAoADgAADAAcACwATABcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQIAAAAAgAAA/wAAAACAAAD/gAAAAIAAAP4AAAAAgAAAAQAAAP8AAAABgAAAAIAAAAAAAYAAAP6AAYAAgAAA/4ABAACAAAD/gP2AA4AAAP8AAAD/gAAA/gADAACAAAD/gAAAAAMAAAAAAoADgAADAAsAEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAIAAAP6AAAAAgAAAAIAAAP+AAAABgAAA/4AAAACAAAAAgAAAAgAAgAAA/4D+AAOAAAD/gAAA/4AAAP2AAAACgAAAAIAAAACAAAD8gAAAAAMAAAAAAoADgAADAAsAEwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAIAAAP6AAAAAgAAAAIAAAP+AAAABgAAA/4AAAACAAAAAgAAAAgAAgAAA/4D+AAOAAAD/gAAA/4AAAP2AAAABgAAAAIAAAAGAAAD8gAAAAAMAAACAAoADAAADAAcACwAAAQEBAQEBAQEBAQEBAAAAAAKAAAD9gAAAAoAAAP2AAAACgAAAAIAAgAAA/4ABAACAAAD/gAEAAIAAAP+AAAAABAAAAAACgAOAAAMABwALAA8AAAEBAQEBAQEBAQEBAQEBAQEAgAAAAYAAAP4AAAAAgAAAAYAAAACAAAD+AAAAAYAAAAAAAIAAAP+AAIACgAAA/YAAAAKAAAD9gAKAAIAAAP+AAAEAAAAAA4ADAAALAAABAQEBAQEBAQEBAQEAgAAA/4AAAAOAAAD/gAAA/wAAAP+AAAAAAAKAAAAAgAAA/4AAAP2AAAACgAAA/YAAAAACAAAAAAKAA4AAAwANAAABAQEBAQEBAQEBAQEBAQIAAAAAgAAA/YAAAAIAAAD+gAAAAYAAAP6AAAACgACAAAD/gP2AA4AAAP+AAAD/gAAA/4AAAP4AAAAAAQAAAAADAAOAABsAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAIAAAACAAAD/gAAA/4AAAAMAAAD/AAAA/wAAAACAAAAAgAAA/4AAAP+AAAABAAAAAQAAAAAAAQAAAACAAAAAgAAAAIAAAAEAAAD/AAAAAIAAAP+AAAD/gAAA/4AAAP+AAAD/gAAAAIAAAP8AAAAAAQAAAAACgAOAAAcAAAEBAQEBAQEBAQAAAP8AAAACgAAA/wAAAAAAAwAAAACAAAD/gAAA/QAAAAAJAAAAAAKAA4AAAwAHAAsADwATABcAGwAfACMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAYAAAACAAAD+AAAAAIAAAACAAAAAgAAA/wAAAACAAAD/AAAAAIAAAACAAAAAgAAA/gAAAACAAAABgAAAAIAAAAAAAYAAAP6AAAABgAAA/oABgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAgACAAAD/gAAAAIAAAP+AAIAAgAAA/4AAAACAAAD/gAAAAAEAAAAAA4ADgAAfAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAA/4AAAACAAAAAgAAAAYAAAACAAAAAgAAA/4AAAACAAAD+gAAAAIAAAP+AAAD/gAAA/4AAAACAAAAAAACAAAABAAAAAQAAAACAAAAAgAAA/4AAAP+AAAD/AAAA/wAAAP+AAAABgAAAAQAAAACAAAD/gAAA/wAAAP6AAAAAAgAAAAADgAKAAAcAHwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBgAAAAIAAAP+AAAD/gAAA/4AAAP+AAAAAgAAAAYAAAACAAAABAAAA/4AAAP+AAAAAgAAAAIAAAP8AAAD/gAAAAIAAgAAAAIAAAACAAAD+gP+AAIAAAAGAAAAAgAAA/4AAAACAAAD/gAAA/4AAAP+AAAD/gAAA/4AAAACAAAD/gAADAAD/gAMAA4AAAwAHABcAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQIAAAD/AAAAAQAAAP8AAAD/AAAAAIAAAAIAAAAAgAAA/4AAAACAAAD/gAAA/oAAAAGAAIAAAP+AAQAAgAAA/4D9AAOAAAAAgAAA/4AAAP+AAAD/gAAA/4AAAP+AAAD+gAAAAAIAAAAAAwADgAADABkAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAgAAAP8AAAD/gAAA/4AAAACAAAABAAAA/4AAAACAAAABgAAA/wAAAACAAAAAgAAA/4AAAACAAQAAAP8A/4AAgAAAAQAAAACAAAAAgAAAAIAAAACAAAD/gAAA/4AAAP+AAAD+gAAA/4AAAAABAAAAAAKAA4AAFwAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAP+AAAD/gAAAAIAAAACAAAABgAAA/wAAAP+AAAABgAAA/oAAAACAAAABAAAAAAAAgAAAAIAAAAGAAAAAgAAAAIAAAP+AAAD/gAAA/4AAAP+AAAD/gAAA/4AAAP+AAAAAAwAAAAADgAOAAAcADwAjAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQECAAAAAIAAAP6AAAAAgAAAAQAAAP+AAAD/gAAA/4AAAAAAAAD/gAAA/4AAAACAAAAAgAAAAYAAAACAAAAAgAAA/4AAAP+AAAAAgACAAAAAgAAA/4AAAP+AAYAAgAAAAIAAAP+AAAD/gP4AAIAAAACAAAABgAAAAIAAAACAAAD/gAAA/4AAAP6AAAD/gAAA/4AAAAABAAD/gAOAA4AADwAAAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAQAAAAEAAAABAAAA/4AAAP6AAAD/gAAA/4AAgAAAA4AAAP2AAAACgAAA/YAAAP+AAAD/gAAA/4AAAAACAAAAAAOAAoAAAwAPAAABAQEBAQEBAQEBAQEBAQEBAYAAAP+AAAD/gAAA/4AAAACAAAADAAAA/wAAAP+AAAAAgAGAAAD+gP+AAIAAAAGAAAAAgAAA/4AAAP6AAAD/gAACAAAAAAKAA4AAAwAHAAABAQEBAQEBAQIAAAD+gAAA/4AAAAKAAAAAgAKAAAD9gP+AA4AAAPyAAAEAAAGAAoACAAADAAABAQEBAAAAAAKAAAABgACAAAD/gAAAAAIAAAIAAQADgAADAAcAAAEBAQEBAQEBAAAAAACAAAAAAAAAAIAAAAIAAIAAAP+AAIABAAAA/wAAAgAAAgABAAOAAAMABwAAAQEBAQEBAQEAAAAAAIAAAAAAAAAAgAAAAgAAgAAA/4AAgAEAAAD/AAABAAD/gACAAQAAAwAAAQEBAQAAAAAAgAAA/4ABgAAA/oAAAAACAAACAAEAA4AAAwAHAAABAQEBAQEBAQCAAAAAgAAA/wAAAACAAAACAACAAAD/gACAAQAAAP8AAAQAAAIAAgADgAADAAcACwAPAAABAQEBAQEBAQEBAQEBAQEBAAAAAACAAAAAgAAAAIAAAP8AAAAAgAAAAIAAAACAAAACAACAAAD/gAAAAIAAAP+AAIABAAAA/wAAAAEAAAD/AAAEAAACAAIAA4AAAwAHAAsADwAAAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAIAAAACAAAD/AAAAAIAAAACAAAAAgAAAAgAAgAAA/4AAAACAAAD/gACAAQAAAP8AAAABAAAA/wAAAQAAAIACAAKAAAsAAAEBAQEBAQEBAQEBAQCAAAD/gAAAAIAAAAEAAAAAgAAA/4AAAACAAIAAAAEAAAAAgAAA/4AAAP8AAAD/gAAAAAUAAACAAYADAAADAAcACwAPABMAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAACAAAD/AAAAAIAAAP8AAAAAgAAAAAAAAACAAAAAAAAAAIAAAACAAIAAAP+AAIAAgAAA/4AAgACAAAD/gACAAIAAAP+AAIAAgAAA/4AAAAAFAAAAgAGAAwAAAwAHAAsADwATAAABAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAgAAAAAAAAACAAAAAAAAAAIAAAP8AAAAAgAAA/wAAAACAAAAAgACAAAD/gACAAIAAAP+AAIAAgAAA/4AAgACAAAD/gACAAIAAAP+AAAAAAAAAAAAAjAAAAIwAAACMAAAAjAAAAMQAAAEoAAAB2AAAAnwAAAMkAAAECAAABEAAAAS8AAAFOAAABbQAAAYAAAAGJAAABkgAAAZsAAAG6AAAB4wAAAfYAAAIdAAACRwAAAmUAAAJ+AAACogAAArsAAALlAAADCQAAAxcAAAMlAAADTwAAA10AAAOHAAADqwAAA8kAAAPhAAAD/wAABB4AAAQxAAAERAAABFQAAARwAAAEgwAABJYAAASqAAAEzgAABNkAAAT3AAAFFQAABS4AAAVEAAAFaAAABYMAAAWnAAAFtQAABckAAAXoAAAGBgAABjsAAAZaAAAGfgAABowAAAarAAAGuQAABtgAAAbhAAAG7wAABwoAAAclAAAHRAAAB18AAAd6AAAHkgAAB60AAAfGAAAH1AAAB+0AAAgRAAAIHwAACDsAAAhMAAAIZQAACIMAAAihAAAIugAACNkAAAjxAAAJAgAACSEAAAk3AAAJbAAACYUAAAmjAAAJwgAACdAAAAnvAAAKCAAAChYAAAo5AAAKRwAACn0AAAq3AAAKwgAACssAAArzAAALCwAACyMAAAs9AAALSwAAC2MAAAt+AAALhwAAC8EAAAvtAAAMHwAADEMAAAxkAAAMhQAADLEAAAzUAAAM8gAADREAAA07AAANXAAADXQAAA2gAAANxgAADdQAAA3iAAAN+wAADg8AAA4yAAAOUQAADnAAAA6aAAAOvgAADt0AAA8GAAAPHAAADzIAAA9TAAAPcgAAD5MAAA+0AAAP4AAAEAYAABAnAAAQUgAAEHwAABCdAAAQvgAAEOoAABEQAAARHgAAESwAABFFAAARWQAAEW8AABGOAAARrQAAEdcAABH7AAASDwAAEjIAABJIAAASXgAAEn8AABKeAAASwgAAEuYAABL+AAATHAAAEyoAABNIAAATWwAAE38AABOSAAATtgAAE9QAABPyAAAUBgAAFB8AABQyAAAUSAAAFG8AABR9AAAUsgAAFN4AABUKAAAVLQAAFVIAABV0AAAVpgAAFb4AABXWAAAV5AAAFe0AABX7AAAWCQAAFhIAABYgAAAWOQAAFlIAABZlAAAWhAAAFqM) format('truetype');
}
</style>