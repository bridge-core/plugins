<template>
	<div style="padding:10px; overflow:scroll;">
		<h1>Selector Generator</h1>
		<v-autocomplete @change="DuplicateModuleDetector" style="margin-top: 5px" inset dense mandatory outlined v-model="SelectedModule" :items="Modules"
			hide-details :menu-props="{
				maxHeight: 220,
				rounded: 'lg',
				'nudge-top': -8,
				transition: 'slide-y-transition'
			}" />
		<v-btn :disabled="DisableButton" block color="primary" @click="AddModule" style="margin-bottom: 10px;">Add Module</v-btn>
		<v-btn color="primary" @click="Generate" :disabled="SelectorModules.length == 0">
			Generate</v-btn>
		<v-btn @click="CopyOutput" :disabled="Output == 'No Data'">Copy Output</v-btn>
		<br></br>
		<div class="Output">
			<pre ref="text">{{ Output }}</pre>
		</div>
		<div class="RTEditor">
			<h2>Editor</h2>
			<h3>Selector</h3>
			<v-autocomplete style="margin-top: 5px" inset dense mandatory outlined v-model="Selector" :items="['@s', '@p', '@a', '@e', '@r', '@initiator']"
			hide-details :menu-props="{
				maxHeight: 220,
				rounded: 'lg',
				'nudge-top': -8,
				transition: 'slide-y-transition'
			}" />
			<transition-group name="RT-flip-list" tag="v-card">
				<v-card class="RTModule" v-for="(module, i) in SelectorModules" style="margin-bottom: 0.8rem"
					color="sidebarSelection" :key="module.Id">
					<v-card-title>
						{{ module.Type }}
					</v-card-title>
					<v-card-text v-if="module.Type == 'Count'">
						<v-switch v-model="module.Reversed" style="margin-top: 0" inset dense
							:label="'Select Farthest'" />
						<v-text-field type="number" min="0" outlined label="Amount" v-model="module.Value">
						</v-text-field>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Diameters'">
						<v-text-field type="number" outlined label="X Diameter" v-model="module.X"></v-text-field>
						<v-text-field type="number" outlined label="Y Diameter" v-model="module.Y"></v-text-field>
						<v-text-field type="number" outlined label="Z Diameter" v-model="module.Z"></v-text-field>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Family'">
						<v-switch v-model="module.Reverted" style="margin-top: 0" inset dense :label="'Invert'" />
						<v-text-field outlined label="Family Tag" v-model="module.Value"></v-text-field>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Has Item'">
						<v-text-field outlined label="Item Identifier" v-model="module.Item"></v-text-field>
						<v-switch v-model="module.UseData" style="margin-top: 0" inset dense
							:label="'Use Data Value'" />
						<v-text-field type="number" min="0" v-if="module.UseData" outlined label="Data Value"
							v-model="module.Data"></v-text-field>
						<v-switch v-model="module.UseLocation" style="margin-top: 0" inset dense
							:label="'Use Location'" />
						<v-autocomplete v-if="module.UseLocation" style="margin-top: 5px; margin-bottom: 5px;" inset
							dense mandatory outlined v-model="module.Location" @click.native="RefreshSelections"
							:items="SlotLocations" hide-details :menu-props="{
								maxHeight: 220,
								rounded: 'lg',
								'nudge-top': -8,
								transition: 'slide-y-transition'
							}" :disabled="module.UseLocation != module.UseSlot"/>
						<v-switch v-model="module.UseQuantity" style="margin-top: 0" inset dense
							:label="'Use Quantity'" />
						<v-switch v-if="module.UseQuantity" v-model="module.QuantityReverted" style="margin-top: 0"
							inset dense :label="'Invert Quantity'" />
						<v-autocomplete v-if="module.UseQuantity" style="margin-top: 5px" inset dense mandatory outlined
							v-model="module.QuantityMode"
							:items="['Normal','At and Higher','At and Lower','Between At and Second']" hide-details
							:menu-props="{
								maxHeight: 220,
								rounded: 'lg',
								'nudge-top': -8,
								transition: 'slide-y-transition'
							}" />
						<v-text-field type="number" min="0" v-if="module.UseQuantity" outlined label="Quantity"
							v-model="module.Quantity" style="margin-top: 10px;"></v-text-field>
						<v-text-field type="number" min="0"
							v-if="module.QuantityMode == 'Between At and Second' && module.UseQuantity" outlined
							label="Second Quantity" v-model="module.Quantity2"></v-text-field>
						<v-switch v-model="module.UseSlot" style="margin-top: 0" inset dense :label="'Use Slot'" />
						<v-switch v-if="module.UseSlot" v-model="module.SlotReverted" style="margin-top: 0" inset dense
							:label="'Invert Slot'" :disabled="module.UseLocation != module.UseSlot" />
						<v-autocomplete v-if="module.UseSlot" style="margin-top: 5px" inset dense mandatory outlined
							v-model="module.SlotMode"
							:items="['Normal','At and Higher','At and Lower','Between At and Second']" hide-details
							:menu-props="{
								maxHeight: 220,
								rounded: 'lg',
								'nudge-top': -8,
								transition: 'slide-y-transition'
							}" :disabled="module.UseLocation != module.UseSlot" />
						<v-text-field type="number" min="0" v-if="module.UseSlot" style="margin-top: 10px;"
							:disabled="module.UseLocation != module.UseSlot" outlined label="Slot"
							v-model="module.Slot"></v-text-field>
						<v-text-field type="number" min="0"
							v-if="module.SlotMode == 'Between At and Second' && module.UseSlot"
							:disabled="module.UseLocation != module.UseSlot" outlined label="Second Slot"
							v-model="module.Slot2"></v-text-field>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Levels'">
						<v-autocomplete style="margin-top: 5px; margin-bottom: 10px;" inset dense mandatory outlined
							v-model="module.Mode" :items="['Level Only','Level Max Only','Both']" hide-details
							:menu-props="{
								maxHeight: 220,
								rounded: 'lg',
								'nudge-top': -8,
								transition: 'slide-y-transition'
							}" />
						<v-text-field v-if="module.Mode == 'Level Only' || module.Mode == 'Both'" type="number" min="0"
							outlined label="Level Value" v-model="module.Level">
						</v-text-field>
						<v-text-field v-if="module.Mode == 'Level Max Only' || module.Mode == 'Both'" type="number"
							min="0" outlined label="Level Max Value" v-model="module.LevelMax">
						</v-text-field>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Gamemode'">
						<v-switch v-model="module.Reverted" style="margin-top: 0" inset dense :label="'Invert'" />
						<v-autocomplete @click.native="RefreshSelections" style="margin-top: 5px;" inset dense mandatory
							outlined v-model="module.Gamemode" :items="Gamemodes" hide-details :menu-props="{
								maxHeight: 220,
								rounded: 'lg',
								'nudge-top': -8,
								transition: 'slide-y-transition'
							}" />
					</v-card-text>
					<v-card-text v-if="module.Type == 'Name'">
						<v-switch v-model="module.Reverted" style="margin-top: 0" inset dense :label="'Invert'" />
						<v-text-field outlined label="Name Value" v-model="module.Name"></v-text-field>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Radius'">
						<v-autocomplete style="margin-top: 5px; margin-bottom: 10px;" inset dense mandatory outlined
							v-model="module.Mode" :items="['Radius Only','Radius Max Only','Both']" hide-details
							:menu-props="{
								maxHeight: 220,
								rounded: 'lg',
								'nudge-top': -8,
								transition: 'slide-y-transition'
							}" />
						<v-text-field v-if="module.Mode == 'Radius Only' || module.Mode == 'Both'" type="number"
							outlined label="Radius Value" v-model="module.Radius"></v-text-field>
						<v-text-field v-if="module.Mode == 'Radius Max Only' || module.Mode == 'Both'" type="number"
							outlined label="Radius Max Value" v-model="module.RadiusMax"></v-text-field>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Rotation'">
						<v-autocomplete style="margin-top: 5px; margin-bottom: 10px;" inset dense mandatory outlined
							v-model="module.Mode" :items="['X Only','Y Only','Both']" hide-details :menu-props="{
								maxHeight: 220,
								rounded: 'lg',
								'nudge-top': -8,
								transition: 'slide-y-transition'
							}" />
						<div v-if="module.Mode == 'X Only' || module.Mode == 'Both'">
							<h2>X Rotation(Vertical)</h2>
							<v-autocomplete style="margin-top: 5px; margin-bottom: 10px;" inset dense mandatory outlined
								v-model="module.ModeX" :items="['Rotation Only','Rotation Max Only','Both']"
								hide-details :menu-props="{
									maxHeight: 220,
									rounded: 'lg',
									'nudge-top': -8,
									transition: 'slide-y-transition'
								}" />
							<v-text-field v-if="module.ModeX == 'Rotation Only' || module.ModeX == 'Both'" type="number"
								outlined label="Rotation Value" v-model="module.RotationX"></v-text-field>
							<v-text-field v-if="module.ModeX == 'Rotation Max Only' || module.ModeX == 'Both'"
								type="number" outlined label="Rotation Max Value" v-model="module.RotationXMax">
							</v-text-field>
						</div>
						<div v-if="module.Mode == 'Y Only' || module.Mode == 'Both'">
							<h2>Y Rotation(Horizontal)</h2>
							<v-autocomplete style="margin-top: 5px; margin-bottom: 10px;" inset dense mandatory outlined
								v-model="module.ModeY" :items="['Rotation Only','Rotation Max Only','Both']"
								hide-details :menu-props="{
									maxHeight: 220,
									rounded: 'lg',
									'nudge-top': -8,
									transition: 'slide-y-transition'
								}" />
							<v-text-field v-if="module.ModeY == 'Rotation Only' || module.ModeY == 'Both'" type="number"
								outlined label="Rotation Value" v-model="module.RotationY"></v-text-field>
							<v-text-field v-if="module.ModeY == 'Rotation Max Only' || module.ModeY == 'Both'"
								type="number" outlined label="Rotation Max Value" v-model="module.RotationYMax">
							</v-text-field>
						</div>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Score'">
						<v-text-field outlined label="Objective" v-model="module.Objective"></v-text-field>
						<v-switch v-model="module.Reverted" style="margin-top: 0" inset dense :label="'Invert'" />
						<v-autocomplete style="margin-top: 5px; margin-bottom: 10px;" inset dense mandatory outlined
							v-model="module.Mode"
							:items="['Normal','At and Higher','At and Lower','Between At and Second']" hide-details
							:menu-props="{
								maxHeight: 220,
								rounded: 'lg',
								'nudge-top': -8,
								transition: 'slide-y-transition'
							}" />
						<v-text-field type="number" outlined label="Score Value" v-model="module.Score"></v-text-field>
						<v-text-field v-if="module.Mode == 'Between At and Second'" type="number" outlined
							label="Score 2 Value" v-model="module.Score2"></v-text-field>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Tag'">
						<v-switch v-model="module.Reverted" style="margin-top: 0" inset dense :label="'Invert'" />
						<v-text-field outlined label="Tag" v-model="module.Value"></v-text-field>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Type'">
						<v-switch v-model="module.Reverted" style="margin-top: 0" inset dense :label="'Invert'" />
						<v-switch v-model="module.ManualInput" style="margin-top: 0" inset dense
							:label="'Manual Input'" />
						<v-autocomplete v-if="!module.ManualInput" style="margin-top: 5px; margin-bottom: 10px;"
							@click.native="RefreshSelections" inset dense mandatory outlined v-model="module.Value"
							:items="Entities" hide-details :menu-props="{
								maxHeight: 220,
								rounded: 'lg',
								'nudge-top': -8,
								transition: 'slide-y-transition'
							}" />
						<v-text-field v-if="module.ManualInput" outlined label="Entity Identifier"
							v-model="module.Value"></v-text-field>
					</v-card-text>
					<v-card-text v-if="module.Type == 'Coordinates'">
						<v-text-field outlined label="X Coordinate" v-model="module.X"></v-text-field>
						<v-text-field outlined label="Y Coordinate" v-model="module.Y"></v-text-field>
						<v-text-field outlined label="Z Coordinate" v-model="module.Z"></v-text-field>
					</v-card-text>
					<v-card-actions>
						<v-btn icon color="error" @click="DeleteModule(i)">
							<v-icon> mdi-delete </v-icon>
						</v-btn>
						<v-btn icon color="primary" @click="MoveModuleUp(i)" :disabled="i == 0">
							<v-icon> mdi-arrow-up-box </v-icon>
						</v-btn>
						<v-btn icon color="primary" @click="MoveModuleDown(i)"
							:disabled="i == SelectorModules.length-1">
							<v-icon> mdi-arrow-down-box </v-icon>
						</v-btn>
						<v-btn v-if="module.UseLocation != module.UseSlot" icon color="error"
							@click="ShowInfoWindow('ERROR','You must have both Location and Slot enabled for this module to work!')">
							<v-icon>mdi-information-outline</v-icon>
						</v-btn>
					</v-card-actions>
				</v-card>
			</transition-group>
		</div>
		<div class="Toast" id="Popup">
			<h2>Copied</h2>
		</div>
	</div>
</template>

<script>
import { createInformationWindow } from "@bridge/windows";

export default {
	data: () => ({
		DisableButton: false,
		Selector: "@s",
		SelectedModule: "",
		SelectorModules: [],
		SlotLocations: [],
		Modules: [
			"Count",
			"Diameters",
			"Family",
			"Has Item",
			"Levels",
			"Gamemode",
			"Name",
			"Radius",
			"Rotation",
			"Score",
			"Tag",
			"Type",
			"Coordinates"
		],
		Gamemodes: [],
		Entities: [],
		Output: "No Data"
	}),
	methods: {
		AddModule() {
			if (this.SelectedModule == "Count")
				this.SelectorModules.push(new Count());
			else if (this.SelectedModule == "Diameters")
				this.SelectorModules.push(new Diameters());
			else if (this.SelectedModule == "Family")
				this.SelectorModules.push(new Family());
			else if (this.SelectedModule == "Has Item")
				this.SelectorModules.push(new HasItem());
			else if (this.SelectedModule == "Levels")
				this.SelectorModules.push(new Levels());
			else if (this.SelectedModule == "Gamemode")
				this.SelectorModules.push(new Gamemode());
			else if (this.SelectedModule == "Name")
				this.SelectorModules.push(new Name());
			else if (this.SelectedModule == "Radius")
				this.SelectorModules.push(new Radius());
			else if (this.SelectedModule == "Rotation")
				this.SelectorModules.push(new Rotation());
			else if (this.SelectedModule == "Score")
				this.SelectorModules.push(new Score());
			else if (this.SelectedModule == "Tag")
				this.SelectorModules.push(new Tag());
			else if (this.SelectedModule == "Type")
				this.SelectorModules.push(new Type());
			else if (this.SelectedModule == "Coordinates")
				this.SelectorModules.push(new Coordinates());
			this.DuplicateModuleDetector(this.SelectedModule);
		},
		MoveModuleUp(Index) {
			MoveArray(this.SelectorModules, Index, Index - 1)
		},
		MoveModuleDown(Index) {
			MoveArray(this.SelectorModules, Index, Index + 1)
		},
		DeleteModule(Id) {
			this.SelectorModules.splice(Id, 1);
			this.DuplicateModuleDetector(this.SelectedModule);
		},
		RefreshSelections() {
			this.SlotLocations = Locations;
			this.Gamemodes = Gamemodes;
			this.Entities = EntityPresets;
		},
		ShowInfoWindow(displayName, description) {
			createInformationWindow(displayName, description);
		},
		DuplicateModuleDetector(val) {
			if (val == "Count" && this.SelectorModules.find(x => x.Type == 'Count') != undefined) {
				this.DisableButton = true;
			}
			else if (val == "Diameters" && this.SelectorModules.find(x => x.Type == 'Diameters') != undefined) {
				this.DisableButton = true;
			}
			else if (val == "Levels" && this.SelectorModules.find(x => x.Type == 'Levels') != undefined) {
				this.DisableButton = true;
			}
			else if (val == "Gamemode" && this.SelectorModules.find(x => x.Type == 'Gamemode') != undefined) {
				this.DisableButton = true;
			}
			else if (val == "Name" && this.SelectorModules.find(x => x.Type == 'Name') != undefined) {
				this.DisableButton = true;
			}
			else if (val == "Radius" && this.SelectorModules.find(x => x.Type == 'Radius') != undefined) {
				this.DisableButton = true;
			}
			else if (val == "Rotation" && this.SelectorModules.find(x => x.Type == 'Rotation') != undefined) {
				this.DisableButton = true;
			}
			else if (val == "Type" && this.SelectorModules.find(x => x.Type == 'Type') != undefined) {
				this.DisableButton = true;
			}
			else if (val == "Coordinates" && this.SelectorModules.find(x => x.Type == 'Coordinates') != undefined) {
				this.DisableButton = true;
			}
			else {
				this.DisableButton = false;
			}
		},
		Generate() {
			var Modules = [];
			var HasItemModules = [];
			var ScoreModules = [];
			this.SelectorModules.forEach(mod => {
				if(mod.Type == 'Has Item') {
					HasItemModules.push(mod.Construct());
				}
				else if(mod.Type == 'Score') {
					ScoreModules.push(mod.Construct());	
				}
				else {
					Modules.push(mod.Construct());
				}
			});
			
			var counter = 0;
			var construct = "";
			Modules.forEach(module => {
				if(counter > 0)
				{
					construct += `,${module}`;
				}
				else {
					construct += module;
				}
				counter++;
			});

			var HasItemConstruct = "";
			var HasItemCounter = 0;
			HasItemModules.forEach(module => {
				if(HasItemCounter > 0)
				{
					HasItemConstruct += `,${module}`;
				}
				else {
					HasItemConstruct += module;
				}
				HasItemCounter++;
			});

			var ScoreConstruct = "";
			var ScoreCounter = 0;
			ScoreModules.forEach(module => {
				if(ScoreCounter > 0)
				{
					ScoreConstruct += `,${module}`;
				}
				else {
					ScoreConstruct += module;
				}
				ScoreCounter++;
			});
			if(ScoreConstruct != "")
				construct += construct != ""? `,scores=[${ScoreConstruct}]`: `scores={${ScoreConstruct}}`;
			if(HasItemConstruct != "")
				construct += construct != ""? `,hasitem=[${HasItemConstruct}]`: `hasitem=[${HasItemConstruct}]`;
			this.Output = `${this.Selector}[${construct}]`;
		},
		CopyOutput() {
			navigator.clipboard.writeText(this.Output);
			var Toast = document.getElementById("Popup");
			Toast.style.animation = "PopupAnimation 2s";
			Toast.addEventListener("animationend", (ev) => {
				ev.target.style.animation = "";
				Toast.removeEventListener("animationend", (ev) => { });
			});
		}
	}
}

function MoveArray(arr, fromIndex, toIndex) {
	var element = arr[fromIndex];
	arr.splice(fromIndex, 1);
	arr.splice(toIndex, 0, element);
}

const EntityPresets = [
	"minecraft:allay",
	"minecraft:axolotl",
	"minecraft:bat",
	"minecraft:bee",
	"minecraft:cat",
	"minecraft:cave_spider",
	"minecraft:chicken",
	"minecraft:cod",
	"minecraft:cow",
	"minecraft:creeper",
	"minecraft:dolphin",
	"minecraft:donkey",
	"minecraft:drowned",
	"minecraft:elder_guardian",
	"minecraft:enderman",
	"minecraft:evocation_illager",
	"minecraft:fox",
	"minecraft:frog",
	"minecraft:glow_squid",
	"minecraft:goat",
	"minecraft:guardian",
	"minecraft:horse",
	"minecraft:husk",
	"minecraft:iron_golem",
	"minecraft:llama",
	"minecraft:mooshroom",
	"minecraft:mule",
	"minecraft:ocelot",
	"minecraft:panda",
	"minecraft:parrot",
	"minecraft:phantom",
	"minecraft:pig",
	"minecraft:pillager",
	"minecraft:player",
	"minecraft:polar_bear",
	"minecraft:pufferfish",
	"minecraft:rabbit",
	"minecraft:ravager",
	"minecraft:salmon",
	"minecraft:sheep",
	"minecraft:silverfish",
	"minecraft:skeleton",
	"minecraft:skeleton_horse",
	"minecraft:slime",
	"minecraft:spider",
	"minecraft:squid",
	"minecraft:stray",
	"minecraft:tadpole",
	"minecraft:tropicalfish",
	"minecraft:turtle",
	"minecraft:vex",
	"minecraft:villager",
	"minecraft:villager_v2",
	"minecraft:vindicator",
	"minecraft:wandering_trader",
	"minecraft:witch",
	"minecraft:wolf",
	"minecraft:zombie",
	"minecraft:zombie_villager",
	"minecraft:zombie_villager_v2",
	"minecraft:blaze",
	"minecraft:enderman",
	"minecraft:ghast",
	"minecraft:hoglin",
	"minecraft:magma_cube",
	"minecraft:piglin",
	"minecraft:piglin_brute",
	"minecraft:strider",
	"minecraft:wither_skeleton",
	"minecraft:zoglin",
	"minecraft:ender_crystal",
	"minecraft:ender_dragon",
	"minecraft:enderman",
	"minecraft:shulker"
]

const Locations = [
	"slot.armor",
	"slot.armor.chest",
	"slot.armor.feet",
	"slot.armor.head",
	"slot.armor.legs",
	"slot.chest",
	"slot.enderchest",
	"slot.equippable",
	"slot.hotbar",
	"slot.inventory",
	"slot.saddle",
	"slot.weapon.mainhand",
	"slot.weapon.offhand"
]

const Gamemodes = [
	"default",
	"survival",
	"creative",
	"adventure",
	"spectator"
]

class Count {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Value = 0;
		this.Type = "Count";
		this.Reversed = false;
	}

	Construct() {
		return this.Reversed? `c=-${this.Value}` : `c=${this.Value}`;
	}
}

class Diameters {
	constructor() {
		this.Id = crypto.randomUUID();
		this.X = 0;
		this.Y = 0;
		this.Z = 0;
		this.Type = "Diameters";
	}

	Construct() {
		return `dx=${this.X},dy=${this.Y},dz=${this.Z}`;
	}
}

class Family {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Value = "hostile";
		this.Type = "Family";
		this.Reverted = false;
	}

	Construct() {
		return `family=${this.Reverted? `!${this.Value}` : `${this.Value}`}`;
	}
}

class HasItem {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Data = 0;
		this.Item = "apple";
		this.Location = "slot.armor";
		this.Quantity = 0;
		this.Quantity2 = 0;
		this.Slot = 0;
		this.Slot2 = 0;

		this.UseData = false;
		this.UseLocation = false;
		this.UseSlot = false;
		//Mode 0 = Normal, Mode 1 = At and Higher, Mode 2 = At and Lower, Mode 3 = Between At and Second Value
		this.UseQuantity = false;
		this.QuantityMode = "Normal";
		this.QuantityReverted = false;
		this.SlotMode = "Normal";
		this.SlotReverted = false;

		this.Type = "Has Item";
	}

	Construct() {
		var construct = `item=${this.Item}`;
		if(this.UseData) {
			construct += `,data=${this.Data}`;
		}
		if(this.UseLocation && this.UseSlot) {
			construct += `,location=${this.Location}`;
		}
		if(this.UseSlot && this.UseLocation) {
			if(this.SlotMode == "Normal")
				construct += `,slot=${this.SlotReverted? `!${this.Slot}`: `${this.Slot}`}`;
			if(this.SlotMode == "At and Higher")
				construct += `,slot=${this.SlotReverted? `!${this.Slot}..`: `${this.Slot}..`}`;
			if(this.SlotMode == "At and Lower")
				construct += `,slot=${this.SlotReverted? `!..${this.Slot}`: `..${this.Slot}`}`;
			if(this.SlotMode == "Between At and Second")
				construct += `,slot=${this.SlotReverted? `!${this.Slot}..${this.Slot2}`: `${this.Slot}..${this.Slot2}`}`;
		}
		if(this.UseQuantity) {
			if(this.QuantityMode == "Normal")
				construct += `,quantity=${this.QuantityReverted? `!${this.Quantity}`: `${this.Quantity}`}`;
			if(this.QuantityMode == "At and Higher")
				construct += `,quantity=${this.QuantityReverted? `!${this.Quantity}..`: `${this.Quantity}..`}`;
			if(this.QuantityMode == "At and Lower")
				construct += `,quantity=${this.QuantityReverted? `!..${this.Quantity}`: `..${this.Quantity}`}`;
			if(this.QuantityMode == "Between At and Second")
				construct += `,quantity=${this.QuantityReverted? `!${this.Quantity}..${this.Quantity2}`: `${this.Quantity}..${this.Quantity2}`}`;
		}

		return `{${construct}}`;
	}
}

class Levels {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Level = 0;
		this.LevelMax = 1;
		this.Mode = "Level Only";
		this.Type = "Levels";
	}

	Construct() {
		if(this.Mode == "Level Only")
			return `l=${this.Level}`;
		if(this.Mode == "Level Max Only")
			return `lm=${this.LevelMax}`;
		if(this.Mode == "Both")
			return `l=${this.Level},lm=${this.LevelMax}`;
	}
}

class Gamemode {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Gamemode = "default";
		this.Reverted = false;
		this.Type = "Gamemode";
	}

	Construct() {
		return `m=${this.Reverted? `!${this.Gamemode}`: `${this.Gamemode}`}`;
	}
}

class Name {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Name = "Example";
		this.Reverted = false;
		this.Type = "Name";
	}

	Construct() {
		if(this.Name.includes(" "))
			return `name=${this.Reverted? `!"${this.Name}"`: `"${this.Name}"`}`;
		else
			return `name=${this.Reverted? `!${this.Name}`: `${this.Name}`}`;
	}
}

class Radius {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Radius = 0;
		this.RadiusMax = 1;
		this.Mode = "Radius Only";
		this.Type = "Radius";
	}

	Construct() {
		if(this.Mode == "Radius Only")
			return `r=${this.Radius}`;
		if(this.Mode == "Radius Max Only")
			return `rm=${this.RadiusMax}`;
		if(this.Mode == "Both")
			return `r=${this.Radius},rm=${this.RadiusMax}`;
	}
}

class Rotation {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Mode = "Both";
		//Rotation X is vertical
		this.ModeX = "Rotation Only";
		this.RotationX = 0;
		this.RotationXMax = 1;
		//Rotation Y is horizontal
		this.ModeY = "Rotation Only";
		this.RotationY = 0;
		this.RotationYMax = 1;
		this.Type = "Rotation";
	}

	Construct() {
		if(this.Mode == "X Only")
		{
			if(this.ModeX == "Rotation Only")
				return `rx=${this.RotationX}`;
			if(this.ModeX == "Rotation Max Only")
				return `rxm=${this.RotationXMax}`;
			if(this.ModeX == "Both")
				return `rx=${this.RotationX},rxm=${this.RotationXMax}`;
		}
		if(this.Mode == "Y Only")
		{
			if(this.ModeY == "Rotation Only")
				return `ry=${this.RotationY}`;
			if(this.ModeY == "Rotation Max Only")
				return `rym=${this.RotationYMax}`;
			if(this.ModeY == "Both")
				return `ry=${this.RotationY},rym=${this.RotationYMax}`;
		}
		if(this.Mode == "Both")
		{
			var construct = ""
			if(this.ModeY == "Rotation Only")
				construct += `ry=${this.RotationY}`;
			if(this.ModeY == "Rotation Max Only")
				construct += `rym=${this.RotationYMax}`;
			if(this.ModeY == "Both")
				construct += `ry=${this.RotationY},rym=${this.RotationYMax}`;
			if(this.ModeX == "Rotation Only")
				construct += `,rx=${this.RotationX}`;
			if(this.ModeX == "Rotation Max Only")
				construct += `,rxm=${this.RotationXMax}`;
			if(this.ModeX == "Both")
				construct += `,rx=${this.RotationX},rxm=${this.RotationXMax}`;
			
			return construct;
		}
	}
}

class Score {
	constructor() {
		this.Id = crypto.randomUUID();
		//Mode 0 = Normal, Mode 1 = At and Higher, Mode 2 = At and Lower, Mode 3 = Between At and Second Value
		this.Mode = "Normal";
		this.Objective = "Example";
		this.Score = 0;
		this.Score2 = 1;
		this.Reverted = false;
		this.Type = "Score";
	}

	Construct() {
			var construct = "";
			if(this.Mode == "Normal")
				construct += `${this.Objective}=${this.Reverted? `!${this.Score}`: `${this.Score}`}`;
			if(this.Mode == "At and Higher")
				construct += `${this.Objective}=${this.Reverted? `!${this.Score}..`: `${this.Score}..`}`;
			if(this.Mode == "At and Lower")
				construct += `${this.Objective}=${this.Reverted? `!..${this.Score}`: `..${this.Score}`}`;
			if(this.Mode == "Between At and Second")
				construct += `${this.Objective}=${this.Reverted? `!${this.Score}..${this.Score2}`: `${this.Score}..${this.Score2}`}`;

			return construct;
	}
}

class Tag {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Value = "Example";
		this.Reverted = false;
		this.Type = "Tag";
	}

	Construct() {
		return `tag=${this.Reverted? `!${this.Value}` : `${this.Value}`}`
	}
}

class Type {
	constructor() {
		this.Id = crypto.randomUUID();
		this.Value = EntityPresets[0];
		this.ManualInput = false;
		this.Reverted = false;
		this.Type = "Type";
	}

	Construct() {
		return `type=${this.Reverted? `!${this.Value}` : `${this.Value}`}`
	}
}

class Coordinates {
	constructor() {
		this.Id = crypto.randomUUID();
		this.X = "~";
		this.Y = "~";
		this.Z = "~";
		this.Type = "Coordinates";
	}

	Construct() {
		return `x=${this.X},y=${this.Y},z=${this.Z}`;
	}
}
</script>

<style>
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
</style>