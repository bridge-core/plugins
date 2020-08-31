# Simply Json
Simply Json is a plugin that adds components and auto completions to bridge.

### How to use components
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
```

### How to use auto completions
The auto completions are used in custom components. Here is a list:
* $general.ores #This has a list of ores. Will add more in the future.
* $upcraft.difficulty #This is different difficulties. Use this in any way you want.
