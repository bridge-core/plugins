<template>
    <div style="padding:10px; overflow:scroll;">
        <h1>Loop Tool</h1>
        <div class="TitleButtonsGrid">
            <v-btn v-if="Selection==0" class="TitleButton" color="primary" block @click="SelectListLooper">List Looper</v-btn>
            <v-btn v-if="Selection==1" class="TitleButton" block @click="SelectListLooper">List Looper</v-btn>
            <v-btn v-if="Selection==1" class="TitleButton" color="primary" block>Number Looper</v-btn>
            <v-btn v-if="Selection==0" class="TitleButton" block @click="SelectNumberLooper">Number Looper</v-btn>
        </div>
        <div v-if="Selection==0">
            <v-btn icon @click="ShowInfoWindow('Input List Help','Input list is where you put your list in the textbox for example 1,2,3,4')"><v-icon>mdi-information-outline</v-icon></v-btn>
            <v-textarea outlined label="Input List" v-model="list"></v-textarea>
            <v-btn icon @click="ShowInfoWindow('Split List Help','Split List At is where you input the character to turn your input list into an actualy list. For example inputting | with the input 1|2|3|4 is the same as [1,2,3,4]')"><v-icon>mdi-information-outline</v-icon></v-btn>
            <v-text-field outlined label="Split List At" v-model="split"></v-text-field>
            <v-btn icon @click="ShowInfoWindow('Output Template','Output Template is where you specify the output of the loop. The value outputted from the list is {{out}} for example /say {{out}}')"><v-icon>mdi-information-outline</v-icon></v-btn>
            <v-text-field outlined label="Output Template" v-model="outputTemplate"></v-text-field>
            <v-btn color="primary" @click="GenerateListOutput" :disabled="!list || !split || !outputTemplate">Generate</v-btn>
            <v-btn @click="CopyListOutput" :disabled="ListOutput == 'No Data' || !ListOutput">Copy Output</v-btn>
            <br></br>
            <div class="Output"><pre ref="text">{{ ListOutput }}</pre></div>
        </div>
        <div v-else>
            <v-btn icon @click="ShowInfoWindow('Loop Start-At Help','Loop Start-At is where you input which number you want the loop to start at.')"><v-icon>mdi-information-outline</v-icon></v-btn>
            <v-text-field type="number" min="0" outlined label="Loop Start-At" v-model="LTloopStart"></v-text-field>
            <v-btn icon @click="ShowInfoWindow('Loop End-At Help','Loop End-At is where you input which number you want the loop to end at.')"><v-icon>mdi-information-outline</v-icon></v-btn>
            <v-text-field type="number" min="1" outlined label="Loop End-At" v-model="LTloopEnd"></v-text-field>
            <v-btn icon @click="ShowInfoWindow('Output Template','Output Template is where you specify the output of the loop. The value outputted from the list is {{out}} for example /say {{out}}')"><v-icon>mdi-information-outline</v-icon></v-btn>
            <v-text-field outlined label="Output Template" v-model="numberOutputTemplate"></v-text-field>
            <v-btn color="primary" @click="GenerateNumberOutput" :disabled="!numberOutputTemplate || LTloopStart >= LTloopEnd || LTloopStart < 0">Generate</v-btn>
            <v-btn @click="CopyNumberOutput" :disabled="NumberOutput == 'No Data' || !NumberOutput">Copy Output</v-btn>
            <br></br>
            <div class="Output"><pre ref="text">{{ NumberOutput }}</pre></div>
        </div>
        <div class="Toast" id="Popup">
            <h2>Copied</h2>
        </div>
    </div>
</template>
    
<script>
import { createInformationWindow } from "@bridge/windows";

export default
    {
        data: () => ({
            Selection: 0,
            list: "",
            split:",",
            outputTemplate:"/say {{out}}",
            numberOutputTemplate:"/say {{out}}",
            LTloopStart: 1,
            LTloopEnd:10,
            ListOutput:"No Data",
            NumberOutput: "No Data"
        }),
        methods:
        {
            GenerateListOutput() {
                this.ListOutput = "";
                var splitList = this.list.split(this.split);
                splitList.forEach(val => {
                    this.ListOutput += `${this.outputTemplate.replace("{{out}}", val)}\n`;
                });
            },
            GenerateNumberOutput() {
                this.NumberOutput = "";
                this.LTloopStart = parseInt(this.LTloopStart);
                this.LTloopEnd = parseInt(this.LTloopEnd);
                for(let i = this.LTloopStart; i <= this.LTloopEnd; i++)
                {
                    this.NumberOutput += `${this.numberOutputTemplate.replace("{{out}}", i)}\n`
                }
            },
            CopyNumberOutput() {
                navigator.clipboard.writeText(this.NumberOutput);
                var Toast = document.getElementById("Popup");
                Toast.style.animation = "PopupAnimation 2s";
                Toast.addEventListener("animationend", (ev) => {
                    ev.target.style.animation = "";
                    Toast.removeEventListener("animationend", (ev) => {});
                });
            },
            CopyListOutput() {
                navigator.clipboard.writeText(this.ListOutput);
                var Toast = document.getElementById("Popup");
                Toast.style.animation = "PopupAnimation 2s";
                Toast.addEventListener("animationend", (ev) => {
                    ev.target.style.animation = "";
                    Toast.removeEventListener("animationend", (ev) => {});
                });
            },
            ShowInfoWindow(displayName, description) {
                createInformationWindow(displayName, description);  
            },
            SelectListLooper() {
                this.Selection = 0;
            },
            SelectNumberLooper() {
                this.Selection = 1;
            }
        }
    }
</script>
    
<style>
.Toast {
    background-color: rgba(10,10,10,0.9);
    color: rgb(0,200,0);
    border-radius: 5px;
    position: fixed;
    bottom: -100px;
    padding: 2px;
    display: block;
    width: 100%;
    text-align: center;
    left: 0;
}

.TitleButtonsGrid {
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 20px;
}

.Output {
    background: rgb(32,32,32);
    border-radius: 5px;
    padding: 5px;
}

pre {
    font-family: "Roboto", sans-serif;
    overflow-wrap: break-word;
    overflow: hidden;
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