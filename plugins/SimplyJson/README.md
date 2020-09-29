Simply Json is a plugin that adds components and auto completions to bridge.

## How to use components
**Warning! All component groups and events that you use in the components must be predefined!**
```js
"upcraft:interaction_builder": { //Allows you to quickly build interactions
  { //Having multiple indexes allows you to build multiple interactions at once.
    component_group: "minecraft:example", //Adds the interaction to the defined component group
    add_component_group: "minecraft:example_2", //This is the component group that gets added through the event
    remove_component_group: "minecraft:example", //This is the component group that gets removed through the event
    event_name: "minecraft:event", //This is the event the interaction calls on. It is also the event that adds and removes the component groups
    interacting_text: "action.interact.example", //This is your text that is shown when interacting. Mainly used on mobile and consoles.
    play_sound: "your.sound.example", //The sound used on interacting. If you don't want a sound, you can create a fake sound and set this to that sound.
    interact_item: "minecraft:item", //The item that is used for interacting. If you don't want an item, set this to minecraft:air
    replacing_item: "minecraft:item_2" //This is the item that replaces the interacting item. If you don't want this, set it to the same item as interact_item.
  }
}

"upcraft:variant_builder": { //A tool to keep all your variants in the same place. This has more uses than just that. I just can't find them.
  { //Multiple indexes lets you keep everything together.
    component_group: "minecraft:example", //This is the component group that you want to hold the variant and mark variant in.
    variant_value: 123, //Your variant value.
    mark_variant_value: 123, //Your mark variant value.
    randomize: true, //If true, your variant will be added to the spawn event for a chance to be selected from all randomized component groups
    weight: 1 // The chance of being selected during randomizing compared to the other component groups
  }
}
```

## How to use auto completions
The auto completions are used in custom components. Here is a list:
* $general.ores #This has a list of ores. Will add more in the future.
* $upcraft.difficulty #This is different difficulties. Use this in any way you want.

## Presets!
The presets are used for quickly adding things you want.
* 3d Items #This is used for making 3d items. make sure to change the 2d and 3d item textures and also the model.
