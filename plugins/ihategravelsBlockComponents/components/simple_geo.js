Bridge.register(
    class BlockComponent {
        static component_name = 'bridge:simple_geo'
        static type = 'block'
        unit_cube = false


        onApply({ geometry, texture, render_method }) {
            return {
                'minecraft:block': {
                    components: {
                        'minecraft:geometry': geometry,
                        'minecraft:material_instances': {
                            "*": {
                                "texture": texture,
                                "render_method": render_method
                            }
                        },
                    },
                },
            }
        }

        onPropose() {
            return {
                [BlockComponent.component_name]: {
                    geometry: '$general.model_identifier',
                    render_method: ["opaque","blend","double_sided","alpha_test"],
                    texture: '$dynamic.rp.terrain_texture',
                  }
            }
        }
    }
)