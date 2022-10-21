<template>
    <div style="padding:10px; overflow:scroll;">
        <h1>ID Generator</h1>
        <v-btn @click="GenerateUUID" color="primary">Generate UUID</v-btn>
        <v-btn @click="CopyUUID" :disabled="GeneratedUUID == 'No Data'">Copy Output</v-btn>
        <br></br>
        <div class="Output">
            <pre ref="text">{{ GeneratedUUID }}</pre>
        </div>
        <br></br>
        <h1>Custom ID Generator</h1>
        <v-btn icon @click="ShowInfoWindow('Characters Help','Characters input specifies what characters to use when generating the custom ID. Spaces do not count!')"><v-icon>mdi-information-outline</v-icon></v-btn>
        <v-textarea outlined label="Characters" v-model="CIDCharacters"></v-textarea>
        <v-btn icon @click="ShowInfoWindow('ID Length Help','ID Length specifies how many characters/how long your ID will generate.')"><v-icon>mdi-information-outline</v-icon></v-btn>
        <v-text-field type="number" min="1" outlined label="ID Length" v-model="CIDLength"></v-text-field>
        <v-btn @click="GenerateCustomID" color="primary" :disabled="!CIDCharacters">Generate</v-btn>
        <v-btn @click="CopyCustomID" :disabled="GeneratedCustomID == 'No Data' || !GeneratedCustomID">Copy Output</v-btn>
        <br></br>
        <div class="Output">
            <pre ref="text">{{ GeneratedCustomID }}</pre>
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
        GeneratedUUID: "No Data",
        GeneratedCustomID: "No Data",
        CIDCharacters: "abc123",
        CIDLength: 10
    }),
    methods: {
        CopyUUID() {
            navigator.clipboard.writeText(this.GeneratedUUID);
            var Toast = document.getElementById("Popup");
            Toast.style.animation = "PopupAnimation 2s";
            Toast.addEventListener("animationend", (ev) => {
                ev.target.style.animation = "";
                Toast.removeEventListener("animationend", (ev) => { });
            })
        },
        CopyCustomID() {
            navigator.clipboard.writeText(this.GeneratedCustomID);
            var Toast = document.getElementById("Popup");
            Toast.style.animation = "PopupAnimation 2s";
            Toast.addEventListener("animationend", (ev) => {
                ev.target.style.animation = "";
                Toast.removeEventListener("animationend", (ev) => { });
            })
        },
        GenerateUUID() {
            this.GeneratedUUID = crypto.randomUUID();
        },
        GenerateCustomID() {
            this.GeneratedCustomID = "";
            for (let i = 0; i < this.CIDLength; i++) {
                var Characters = this.CIDCharacters.replace(" ", "").split("");
                var Random = Math.floor(Math.random() * Characters.length);
                this.GeneratedCustomID += Characters[Random];
            }
        },
        ShowInfoWindow(displayName, description) {
            createInformationWindow(displayName, description);  
        },
    }
}
</script>

<style>
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
</style>