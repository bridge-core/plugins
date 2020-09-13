Bridge.register(
  class InteractionBuilder {
    static component_name = "upcraft:interaction_builder";

    onApply(arrayData) {
      const GROUPS = {};
      const EVENTS = {};
      arrayData.map((currentData) => {
        GROUPS[currentData.component_group] = {
          "minecraft:interact": {
            interactions: [
              {
                use_item: true,
                interact_text: currentData.interacting_text,
                play_sounds: currentData.play_sound,
                on_interact: {
                  filters: {
                    all_of: [
                      {
                        test: "is_family",
                        subject: "other",
                        value: "player",
                      },
                      {
                        test: "has_equipment",
                        subject: "other",
                        domain: "hand",
                        value: currentData.interact_item,
                      },
                    ],
                  },
                  event: currentData.event_name,
                  target: "self",
                },
                transform_to_item: currentData.replacing_item,
              },
            ],
          }
        };

        EVENTS[currentData.event_name] = {
          add: {
            component_groups: [currentData.add_component_group],
          },
          remove: {
            component_groups: [currentData.remove_component_group],
          }
        }
      });

      return {
        "minecraft:entity": {
          component_groups: {
            ...GROUPS,
          },
          components: {
            //Any components made will go here
          },
          events: {
            ...EVENTS,
          },
        },
      };
    }

    onPropose() {
      return {
        [InteractionBuilder.component_name]: {
          "$dynamic.list.next_index": {
            component_group: "$entity.general.component_group_name",
            add_component_group: "$entity.general.component_group_name",
            remove_component_group: "$entity.general.component_group_name",
            event_name: "$dynamic.cache.eventevents",
            interacting_text: "$general.translatable_text",
            play_sound: "$general.sound",
            interact_item:
              "$general.file_identifier and $general.item_identifier",
            replacing_item:
              "$general.file_identifier and $general.item_identifier",
          },
        },
      };
    }
  }
);
