<template>
    <v-container>
        <h1>Simple Tools</h1>
        <v-btn style="margin-bottom:10px" color="primary" block @click="OpenLoopTool">Loop Tool</v-btn>
        <v-btn style="margin-bottom:10px" color="primary" block @click="OpenIdTool">ID Generator</v-btn>
        <v-btn style="margin-bottom:10px" color="primary" block @click="OpenRawtextTool">JSON Rawtext Generator</v-btn>
        <v-btn style="margin-bottom:10px" color="primary" block @click="OpenGametestUITool">Gametest UI Generator</v-btn>
        <v-btn style="margin-bottom:10px" color="primary" block @click="OpenRenderOffsetTool">Render Offset Corrector</v-btn>
        <!--<v-btn style="margin-bottom:10px" color="primary" block @click="OpenStructureViewerTool">Structure Viewer</v-btn> -->
        <v-btn style="margin-bottom:10px" color="primary" block @click="OpenSelectorGeneratorTool">Selector Generator</v-btn>
        <!-- <v-btn style="margin-bottom:10px" color="primary" block @click="OpenTroubleshooterTool">FAQ Troubleshooter</v-btn> -->
        <!-- <v-btn style="margin-bottom:10px" color="primary" block @click="OpenRecipeGeneratorTool">Recipe Generator</v-btn> -->
    </v-container>
</template>

<script>
import { ContentTab, addTab, Tab, getCurrentTabSystem } from "@bridge/tab";
import { Loop, Id, RawText, GameTestUI, RenderOffset, StructureViewer, Selector, TroubleShooter, Recipe } from "@bridge/ui";
import { readdir } from "@bridge/fs";

//ESM Import for local script files do not work. Please check issue #596
//https://github.com/bridge-core/editor/issues/596
//import { Test } from "../scripts/main.js";
//The error only occurs when you reference a variable/class from the import.
//console.log(new Test());

export default
{
    methods:
    {
        OpenLoopTool()
        {
            addTab(new LoopTab(getCurrentTabSystem()));
        },
        OpenIdTool()
        {
            addTab(new IdTab(getCurrentTabSystem()));
        },
        OpenRawtextTool()
        {
            addTab(new RawTextTab(getCurrentTabSystem()));
        },
        OpenGametestUITool()
        {
            addTab(new GameTestUITab(getCurrentTabSystem()));
        },
        OpenRenderOffsetTool()
        {
            addTab(new RenderOffsetTab(getCurrentTabSystem()));
        },
        OpenStructureViewerTool()
        {
            addTab(new StructureViewerTab(getCurrentTabSystem()));
        },
        OpenSelectorGeneratorTool()
        {
            addTab(new SelectorTab(getCurrentTabSystem()));
        },
        OpenTroubleshooterTool()
        {
            addTab(new TroubleShooterTab(getCurrentTabSystem()));
        },
        OpenRecipeGeneratorTool()
        {
            addTab(new RecipeTab(getCurrentTabSystem()));
        }
    }
}

//ContentTab is broken. Please check issue #595
//https://github.com/bridge-core/editor/issues/595

class LoopTab extends ContentTab
{
    component = Loop;
    type = "LoopTab";

    async isFor() {
        return false
    }
    get icon() {
        return 'mdi-tools'
    }
    get iconColor() {
        return 'warning'
    }
    get name() {
        return 'Loop Tool'
    }
}

class IdTab extends ContentTab
{
    component = Id;
    type = "IdTab";

    async isFor() {
        return false
    }
    get icon() {
        return 'mdi-tools'
    }
    get iconColor() {
        return 'warning'
    }
    get name() {
        return 'Id Generator'
    }
}

class RawTextTab extends ContentTab
{
    component = RawText;
    type = "RawTextTab";

    async isFor() {
        return false
    }
    get icon() {
        return 'mdi-tools'
    }
    get iconColor() {
        return 'warning'
    }
    get name() {
        return 'JSON RawText Generator'
    }
}

class GameTestUITab extends ContentTab
{
    component = GameTestUI;
    type = "GameTestUITab";

    async isFor() {
        return false
    }
    get icon() {
        return 'mdi-tools'
    }
    get iconColor() {
        return 'warning'
    }
    get name() {
        return 'GameTest UI Generator'
    }
}

class RenderOffsetTab extends ContentTab
{
    component = RenderOffset;
    type = "RenderOffsetTab";

    async isFor() {
        return false
    }
    get icon() {
        return 'mdi-tools'
    }
    get iconColor() {
        return 'warning'
    }
    get name() {
        return 'Render Offset Generator'
    }
}

class StructureViewerTab extends ContentTab
{
    component = StructureViewer;
    type = "StructureViewerTab";

    async isFor() {
        return false
    }
    get icon() {
        return 'mdi-tools'
    }
    get iconColor() {
        return 'warning'
    }
    get name() {
        return 'Structure Viewer'
    }
}

class SelectorTab extends ContentTab
{
    component = Selector;
    type = "SelectorTab";

    async isFor() {
        return false
    }
    get icon() {
        return 'mdi-tools'
    }
    get iconColor() {
        return 'warning'
    }
    get name() {
        return 'Selector Generator'
    }
}

class TroubleShooterTab extends ContentTab
{
    component = TroubleShooter;
    type = "TroubleShooterTab";

    async isFor() {
        return false
    }
    get icon() {
        return 'mdi-tools'
    }
    get iconColor() {
        return 'warning'
    }
    get name() {
        return 'FAQ Troubleshooter'
    }
}

class RecipeTab extends ContentTab
{
    component = Recipe;
    type = "RecipeTab";

    async isFor() {
        return false
    }
    get icon() {
        return 'mdi-tools'
    }
    get iconColor() {
        return 'warning'
    }
    get name() {
        return 'Recipe Generator'
    }
}

</script>