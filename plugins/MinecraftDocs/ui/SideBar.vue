<template>
<div id="app">
  <h1>Minecraft Documentation</h1>
    <v-btn color="primary" block @click="openTabAddons">
      <v-icon>mdi-plus-box</v-icon>
      <span>Addons</span>
    </v-btn>
    <br>
	  <v-btn color="primary" block @click="openTabAnimations">
      <v-icon>mdi-animation</v-icon>
      <span>Animations</span>
    </v-btn>
    <br>
	  <v-btn color="primary" block @click="openTabBiomes">
      <v-icon>mdi-earth-box</v-icon>
      <span>Biomes</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabBlocks">
      <v-icon>mdi-cube-outline</v-icon>
      <span>Blocks</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabEntities">
      <v-icon>mdi-minecraft</v-icon>
      <span>Entities</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabEntityEvents">
      <v-icon>mdi-file-code</v-icon>
      <span>Entity Events</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabFeatures">
      <v-icon>mdi-flower</v-icon>
      <span>Features</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabFogs">
      <v-icon>mdi-weather-fog</v-icon>
      <span>Fogs</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabItem">
      <v-icon>mdi-sword</v-icon>
      <span>Item</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabMoLang">
      <v-icon>mdi-alpha-m</v-icon>
      <span>MoLang</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabParticles">
      <v-icon>mdi-snowflake</v-icon>
      <span>Particles</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabRecipes">
      <v-icon>mdi-book</v-icon>
      <span>Recipes</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabSchemas">
      <v-icon>mdi-crane</v-icon>
      <span>Schemas</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabScripting">
      <v-icon>mdi-code-tags</v-icon>
      <span>Scripting</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabTextureSets">
      <v-icon>mdi-image</v-icon>
      <span>Texture Sets</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabUI">
      <v-icon>mdi-application</v-icon>
      <span>UI</span>
    </v-btn>
    <br>
    <v-btn color="primary" block @click="openTabVolumes">
      <v-icon>mdi-volume-high</v-icon>
      <span>Volumes</span>
    </v-btn>
  <v-divider />
</div>
</template>

<script>
const { ContentTab, openTab } = await require('@bridge/tab')
const { Addons, Animations, Biomes, Blocks, Entities, EntityEvents, Features, Fogs, Item, MoLang, Particles, Recipes, Schemas, Scripting, TextureSets, UI, Volumes} = await require('@bridge/ui')

class AddonsTab extends ContentTab {
  type = 'AddonsTab'
  component = Addons

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-plus-box'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Addons'
  }
}

class AnimationsTab extends ContentTab {
  type = 'AnimationsTab'
  component = Animations

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-animation'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Animations'
  }
}

class BiomesTab extends ContentTab {
  type = 'BiomesTab'
  component = Biomes

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-earth-box'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Biomes'
  }
}

class BlocksTab extends ContentTab {
  type = 'BlocksTab'
  component = Blocks

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-cube-outline'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Blocks'
  }
}

class EntitiesTab extends ContentTab {
  type = 'EntitiesTab'
  component = Entities

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-minecraft'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Entities'
  }
}

class EntityEventsTab extends ContentTab {
  type = 'EntityEventsTab'
  component = EntityEvents

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-file-code'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Entity Events'
  }
}

class FeaturesTab extends ContentTab {
  type = 'FeaturesTab'
  component = Features

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-flower'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Features'
  }
}

class FogsTab extends ContentTab {
  type = 'FogsTab'
  component = Fogs

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-weather-fog'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Fogs'
  }
}

class ItemTab extends ContentTab {
  type = 'ItemTab'
  component = Item

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-sword'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Item'
  }
}

class MoLangTab extends ContentTab {
  type = 'MoLangTab'
  component = MoLang

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-alpha-m'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'MoLang'
  }
}

class ParticlesTab extends ContentTab {
  type = 'Particles'
  component = Particles

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-snowflake'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Particles'
  }
}

class RecipesTab extends ContentTab {
  type = 'Recipes'
  component = Recipes

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-book'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Recipes'
  }
}

class SchemasTab extends ContentTab {
  type = 'Schemas'
  component = Schemas

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-crane'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Schemas'
  }
}

class ScriptingTab extends ContentTab {
  type = 'Scripting'
  component = Scripting

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-code-tags'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Scripting'
  }
}

class TextureSetsTab extends ContentTab {
  type = 'TextureSets'
  component = TextureSets

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-image'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Texture Sets'
  }
}

class UITab extends ContentTab {
  type = 'UI'
  component = UI

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-application'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'UI'
  }
}

class VolumesTab extends ContentTab {
  type = 'Volumes'
  component = Volumes

  async isFor() {
    return false
  }
  get icon() {
    return 'mdi-volume-high'
  }
  get iconColor() {
    return 'warning'
  }
  get name() {
    return 'Volumes'
  }
}

export default {
  methods: {
     openTabAddons() {
        openTab(AddonsTab,false)
     },
     openTabAnimations() {
       openTab(AnimationsTab,false)
     },
     openTabBiomes() {
       openTab(BiomesTab,false)
     },
     openTabBlocks() {
       openTab(BlocksTab,false)
     },
     openTabEntities() {
       openTab(EntitiesTab,false)
     },
     openTabEntityEvents() {
       openTab(EntityEventsTab,false)
     },
     openTabFeatures() {
       openTab(FeaturesTab,false)
     },
     openTabFogs() {
       openTab(FogsTab,false)
     },
     openTabItem() {
       openTab(ItemTab,false)
     },
     openTabMoLang() {
       openTab(MoLangTab,false)
     },
     openTabParticles() {
       openTab(ParticlesTab,false)
     },
     openTabRecipes() {
       openTab(RecipesTab,false)
     },
     openTabSchemas() {
       openTab(SchemasTab,false)
     },
     openTabScripting() {
       openTab(ScriptingTab,false)
     },
     openTabTextureSets() {
       openTab(TextureSetsTab,false)
     },
     openTabUI() {
       openTab(UITab,false)
     },
     openTabVolumes() {
       openTab(VolumesTab,false)
     }
  }
}
</script>