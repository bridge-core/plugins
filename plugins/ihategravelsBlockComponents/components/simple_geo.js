Bridge.register(
    class BlockComponent {
        static component_name = 'bridge:simple_geo'
        static type = 'block'


        onApply({ geometry, texture, render_method, ambient_occlusion, face_dimming }) {
            return {
                'minecraft:block': {
                    components: {
                        'minecraft:geometry': geometry,
                        'minecraft:material_instances': {
                            "*": {
                                "texture": texture,
                                "render_method": render_method,
                                "ambient_occlusion": ambient_occlusion,
                                "face_dimming": face_dimming
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
                    ambient_occlusion: '$general.boolean',
                    face_dimming: '$general.boolean',
                    texture: '$dynamic.rp.terrain_texture'
                  }
            }
        }
    }
)
