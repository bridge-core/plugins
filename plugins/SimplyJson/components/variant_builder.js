Bridge.register(
  class VariantBuilder {
    static component_name = "upcraft:variant_builder";

    onApply(arrayData) {
      const GROUPS = {};
      const EVENTS = {};
      arrayData.map((currentData) => {
        GROUPS[currentData.component_group] = {
          "minecraft:variant": {
            value: currentData.variant_value,
          },
          "minecraft:mark_variant": {
            value: currentData.mark_variant_value,
          }
        };

        if(currentData.randomize === true) {
          EVENTS['minecraft:entity_spawned'] = {
            randomize: [
              {
                weight: [currentData.weight],
                add: {
                  component_groups: [
                    [currentData.component_group]
                  ]
                }
              }
            ]
          }
        }
      });

      return {
        "minecraft:entity": {
          component_groups: {
            ...GROUPS,
          },
          components: {
            //Any components will go here
          },
          events: {
            ...EVENTS,
          },
        },
      };
    }

    onPropose() {
      return {
        [VariantBuilder.component_name]: {
          "$dynamic.list.next_index": {
            component_group: "$entity.general.component_group_name",
            variant_value: "$general.number0_15",
            mark_variant_value: "$general.number0_15",
            randomize: "$general.booleen",
            weight: "$general.number0_15",
          }
        }
      }
    }
  }
)
