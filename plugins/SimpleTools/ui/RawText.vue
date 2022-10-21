<template>
    <div style="padding:10px; overflow:scroll;">
        <h1>JSON RawText Generator</h1>
        <div class="TitleButtonsRTGrid">
            <v-btn block color="primary" @click="AddMessageModule">Add Message</v-btn>
            <v-btn block color="primary" @click="AddScoreModule">Add Score</v-btn>
            <v-btn block color="primary" @click="AddTranslationModule">Add Translation</v-btn>
            <v-btn block color="primary" @click="AddSelectorModule">Add Selector</v-btn>
            <v-btn block color="primary" @click="AddTextModificationModule">Add Text-Modifier</v-btn>
        </div>
        <v-btn style="margin-top: 5px;" color="primary" @click="Generate" :disabled="Modules.length == 0">Generate
        </v-btn>
        <v-btn style="margin-top: 5px;" @click="CopyOutput" :disabled="GeneratedRawtext == 'No Data'">Copy Output
        </v-btn>
        <br></br>
        <div class="Output">
            <p>{{ GeneratedRawtext }}</p>
        </div>
        <div class="RTEditor">
            <h2>Editor</h2>
            <transition-group name="RT-flip-list" tag="v-card">
                <v-card class="RTModule" v-for="(module, i) in Modules" style="margin-bottom: 0.8rem"
                    color="sidebarSelection" :key="module.Id">
                    <v-card-title>
                        {{ module.Type }}
                    </v-card-title>
                    <v-card-text>
                        <v-text-field v-if="module.Type == 'Message'" outlined label="Message" v-model="module.Message">
                        </v-text-field>
                        <v-text-field v-if="module.Type == 'Score'" outlined label="Objective"
                            v-model="module.Objective"></v-text-field>
                        <v-text-field v-if="module.Type == 'Score'" outlined label="Score Target(Selector/FakePlayer)"
                            v-model="module.TargetName"></v-text-field>
                        <v-text-field v-if="module.Type == 'Translation'" outlined label="Translation Id"
                            v-model="module.TranslationString"></v-text-field>
                        <v-text-field v-if="module.Type == 'Selector'" outlined label="Selector"
                            v-model="module.Selector"></v-text-field>
                        <v-autocomplete style="margin-top: 5px" v-if="module.Type == 'Text Modifier'" inset dense
                            mandatory outlined @click.native="onClick" v-model="module.TextMod1"
                            :items="config.map(val => val.NAME)" hide-details :menu-props="{
                            	maxHeight: 220,
                            	rounded: 'lg',
                            	'nudge-top': -8,
                            	transition: 'slide-y-transition'
                            }" />
                        <v-autocomplete style="margin-top: 5px" v-if="module.Type == 'Text Modifier'" inset dense
                            mandatory outlined @click.native="onClick" v-model="module.TextMod2"
                            :items="config.map(val => val.NAME)" hide-details :menu-props="{
                            	maxHeight: 220,
                            	rounded: 'lg',
                            	'nudge-top': -8,
                            	transition: 'slide-y-transition'
                            }" />
                        <v-autocomplete style="margin-top: 5px" v-if="module.Type == 'Text Modifier'" inset dense
                            mandatory outlined @click.native="onClick" v-model="module.TextMod3"
                            :items="config.map(val => val.NAME)" hide-details :menu-props="{
                            	maxHeight: 220,
                            	rounded: 'lg',
                            	'nudge-top': -8,
                            	transition: 'slide-y-transition'
                            }" />
                    </v-card-text>
                    <v-card-actions>
                        <v-btn icon color="error" @click="DeleteModule(i)">
                            <v-icon> mdi-delete </v-icon>
                        </v-btn>
                        <v-btn icon color="primary" @click="MoveModuleUp(i)" :disabled="i == 0">
                            <v-icon> mdi-arrow-up-box </v-icon>
                        </v-btn>
                        <v-btn icon color="primary" @click="MoveModuleDown(i)" :disabled="i == Modules.length-1">
                            <v-icon> mdi-arrow-down-box </v-icon>
                        </v-btn>
                        <v-btn v-if="HasQuotationCharacter(module)" icon color="error"
                            @click="ShowInfoWindow('Error!','One or more of your values contains a quotation character! Please consider using \\ before the character to avoid any errors!')">
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
    props: {
        config: Array
    },
    data: () => ({
        Modules: [],
        GeneratedRawtext: "No Data"
    }),
    async mounted() {
        this.config = Object.values(TextMods);
    },
    methods: {
        Generate() {
            var GeneratedModules = "";
            this.Modules.forEach(module => {
                GeneratedModules += `${module.Construct()},`;
            });
            GeneratedModules = GeneratedModules.slice(0, -1);
            this.GeneratedRawtext = `{"rawtext":[${GeneratedModules}]}`;
        },
        CopyOutput() {
            navigator.clipboard.writeText(this.GeneratedRawtext);
            var Toast = document.getElementById("Popup");
            Toast.style.animation = "PopupAnimation 2s";
            Toast.addEventListener("animationend", (ev) => {
                ev.target.style.animation = "";
                Toast.removeEventListener("animationend", (ev) => { });
            })
        },
        AddMessageModule() {
            this.Modules.push(new Message());
        },
        AddScoreModule() {
            this.Modules.push(new Score());
        },
        AddTranslationModule() {
            this.Modules.push(new Translation());
        },
        AddSelectorModule() {
            this.Modules.push(new Selector());
        },
        AddTextModificationModule() {
            this.Modules.push(new TextModification());
        },
        MoveModuleUp(Index) {
            MoveArray(this.Modules, Index, Index - 1)
        },
        MoveModuleDown(Index) {
            MoveArray(this.Modules, Index, Index + 1)
        },
        DeleteModule(Id) {
            this.Modules.splice(Id, 1);
        },
        onClick() {
            this.config = Object.values(TextMods);
        },
        ShowInfoWindow(displayName, description) {
            createInformationWindow(displayName, description);
        },
        HasQuotationCharacter(module) {
            if (module.Type == "Message")
                return module.Message.replace("\\\"").includes("\"");
            if (module.Type == "Score") {
                var val = false;
                val = module.TargetName.replace("\\\"").includes("\"");
                if (!val)
                    val = module.Objective.replace("\\\"").includes("\"");
                return val;
            }
            if (module.Type == "Translation")
                return module.TranslationString.replace("\\\"").includes("\"");
            if (module.Type == "Selector")
                return module.Selector.replace("\\\"").includes("\"");
        }
    }
}

function MoveArray(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

const ModuleTypes = Object.freeze({
    MESSAGE: "Message",
    SCORE: "Score",
    TRANSLATION: "Translation",
    SELECTOR: "Selector",
    TEXT_MODIFICATION: "Text Modifier"
});

const TextMods = Object.freeze({
    NONE: {
        NAME: "None",
        VALUE: ""
    },
    BLACK: {
        NAME: "Black",
        VALUE: "§0"
    },
    DARK_BLUE: {
        NAME: "Dark Blue",
        VALUE: "§1"
    },
    DARK_GREEN: {
        NAME: "Dark Green",
        VALUE: "§2"
    },
    DARK_AQUA: {
        NAME: "Dark Aqua",
        VALUE: "§3"
    },
    DARK_RED: {
        NAME: "Dark Red",
        VALUE: "§4"
    },
    DARK_PURPLE: {
        NAME: "Dark Purple",
        VALUE: "§5"
    },
    GOLD: {
        NAME: "Gold",
        VALUE: "§6"
    },
    GRAY: {
        NAME: "Gray",
        VALUE: "§7"
    },
    DARK_GRAY: {
        NAME: "Dark Gray",
        VALUE: "§8"
    },
    BLUE: {
        NAME: "Blue",
        VALUE: "§9"
    },
    GREEN: {
        NAME: "Green",
        VALUE: "§a"
    },
    AQUA: {
        NAME: "Aqua",
        VALUE: "§b"
    },
    RED: {
        NAME: "Red",
        VALUE: "§c"
    },
    LIGHT_PURPLE: {
        NAME: "Light Purple",
        VALUE: "§d"
    },
    YELLOW: {
        NAME: "Yellow",
        VALUE: "§e"
    },
    WHITE: {
        NAME: "White",
        VALUE: "§f"
    },
    MINECOIN_GOLD: {
        NAME: "Minecoin Gold",
        VALUE: "§g"
    },
    ITALICS: {
        NAME: "Italics",
        VALUE: "§o"
    },
    BOLD: {
        NAME: "Bold",
        VALUE: "§l"
    },
    OBFUSCATED: {
        NAME: "Obfuscated",
        VALUE: "§k"
    },
    RESET: {
        NAME: "Reset",
        VALUE: "§r"
    }
});

class Message {
    constructor() {
        this.Id = crypto.randomUUID(),
            this.Type = ModuleTypes.MESSAGE;
        this.Message = "";
    }

    Construct() {
        return `{"text":"${this.Message}"}`;
    }
}

class Score {
    constructor() {
        this.Id = crypto.randomUUID(),
            this.Type = ModuleTypes.SCORE;
        this.TargetName = "*";
        this.Objective = "";
    }

    Construct() {
        return `{"score":{"name":"${this.TargetName}","objective":"${this.Objective}"}}`;
    }
}

class Translation {
    constructor() {
        this.Id = crypto.randomUUID(),
            this.Type = ModuleTypes.TRANSLATION;
        this.TranslationString = "commands.op.success";
    }

    Construct() {
        return `{"translate":"${this.TranslationString}"}`;
    }
}

class Selector {
    constructor() {
        this.Id = crypto.randomUUID(),
            this.Type = ModuleTypes.SELECTOR;
        this.Selector = "@e[type=player]";
    }

    Construct() {
        return `{"selector":"${this.Selector}"}`;
    }
}

class TextModification {
    constructor() {
        this.Id = crypto.randomUUID(),
            this.Type = ModuleTypes.TEXT_MODIFICATION;
        this.TextMod1 = "None";
        this.TextMod2 = "None";
        this.TextMod3 = "None";

        this.LocalTextMod1 = "";
        this.LocalTextMod2 = "";
        this.LocalTextMod3 = "";
    }

    Construct() {
        Object.values(TextMods).forEach(val => {
            if (val.NAME == this.TextMod1)
                this.LocalTextMod1 = val.VALUE
            if (val.NAME == this.TextMod2)
                this.LocalTextMod2 = val.VALUE
            if (val.NAME == this.TextMod3)
                this.LocalTextMod3 = val.VALUE
        });
        return `{"text":"${this.LocalTextMod1}${this.LocalTextMod2}${this.LocalTextMod3}"}`;
    }
}
</script>

<style>
.Output {
    background: rgb(32,32,32);
    border-radius: 5px;
    padding: 5px;
}

.RTEditor {
    background: rgb(32, 32, 32);
    border-radius: 5px;
    padding: 5px;
    margin-top: 5px;
}

.TitleButtonsRTGrid {
    justify-content: space-evenly;
    margin: 0 auto;
    display: grid;
    grid-gap: 1rem;
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

@media (min-width: 400px) {
    .TitleButtonsRTGrid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 600px) {
    .TitleButtonsRTGrid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 900px) {
    .TitleButtonsRTGrid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (min-width: 1200px) {
    .TitleButtonsRTGrid {
        grid-template-columns: repeat(5, 1fr);
    }
}

.RT-flip-list-move {
    transition: transform 0.4s;
}

.RT-flip-list-enter-active,
.RT-flip-list-leave-active {
    transition: all 0.4s;
}

.RT-flip-list-enter,
.RT-flip-list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>