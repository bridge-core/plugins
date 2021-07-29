export default function defineComponent({ name, template, schema }) {
    name('bridge:event_animation')
    schema({
        properties: {
            anims: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            description: "Animation to trigger (currently unused)",
                            $ref: '/data/packages/minecraftBedrock/schema/general/reference/clientAnimation.json'
                        },
                        length: {
                            description: "Length of the animation in seconds",
                            type: 'number'
                        },
                        trigger_event: {
                            description: "Event that triggers the animation",
                            $ref: "/data/packages/minecraftBedrock/schema/entity/dynamic/eventEnum.json"
                        },
                        force_stop: {
                            description: "If all animations should be force stopped after the time has elapsed. Defaults to true.",
                            type: 'boolean'
                        },
                        timeline: {
                            description: "OPTIONAL timeline that will be used for the server-side animation",
                            propertyNames: {
                                "pattern": "^\\d+(\\.\\d+)?$"
                            },
                            anyOf: [
                                {
                                    patternProperties: {
                                        "^\\d+(\\.\\d+)?$": {
                                            "type": "array",
                                            "items": {
                                                "$ref": "/data/packages/minecraftBedrock/schema/general/reference/animationEvent.json"
                                            }
                                        }
                                    }
                                },
                                {
                                    patternProperties: {
                                        "^\\d+(\\.\\d+)?$": {
                                            "$ref": "/data/packages/minecraftBedrock/schema/general/reference/animationEvent.json"
                                        }
                                    }
                                }
                            ]

                        }

                    }
                }
            },
            mark_variant_offset: {
                type: 'integer',
                description: "Custom mark variant offset. Default is 0. The first animation in the anims array will be bound to mark_variant == mark_variant_offset + 1"
            }
        }
    })


    template(({ anims, mark_variant_offset }, { create, animation, animationController, identifier, location }) => {

        const aName = `${identifier.split(':').pop()}`
        //const loc = hashString(`${this.name}/${identifier}`)

        if (!mark_variant_offset)
            mark_variant_offset = 0;

        let offset = mark_variant_offset + 1
        let animobj = {}
        let animTransitions = []
        let compGroups = []
        let animNames = []

        create(
            {
                "bridge:no_animation": {
                    "minecraft:mark_variant": {
                        "value": mark_variant_offset
                    }
                }
            },
            'minecraft:entity/component_groups'
        )

        create(
            {
                "minecraft:entity_spawned": {
                    "add": {
                        "component_groups": [
                            "bridge:no_animation"
                        ]
                    }
                },
                "bridge:stop_all_animations": {
                    "remove": {
                        "component_groups": compGroups
                    },
                    "add": {
                        "component_groups": [
                            "bridge:no_animation"
                        ]
                    }
                }
            },
            'minecraft:entity/events'
        )

        anims.forEach((anim, i) => {
            compGroups.push(`bridge:event_animation_${i + offset}`)

            let aname = animation(
                {
                    "animation_length": anim.length,
                    "loop": true,
                    "timeline": anim.timeline
                },
                false
            )
            animNames.push(aname);

        })

        anims.forEach((anim, i) => {
            let name = `${aName}_anim_${i}`

            let compGroup = compGroups[i];
            create(
                {
                    [compGroup]: {
                        "minecraft:mark_variant": {
                            "value": i + offset
                        }
                    }
                },
                'minecraft:entity/component_groups'
            )

            animTransitions.push({ [`animation_${i + offset}`]: `query.mark_variant == ${i + offset}` })

            if (anim.force_stop == undefined)
                anim.force_stop = true

            animobj = Object.assign(animobj, anim.force_stop ? {
                [`animation_${i + offset}`]: {
                    "animations": [
                        animNames[i]
                    ],
                    "on_exit": [
                        "@s bridge:stop_all_animations"
                    ],
                    "transitions": [
                        {
                            "default": "query.any_animation_finished"
                        }
                    ]
                }
            } :
                {
                    [`animation_${i + offset}`]: {
                        "animations": [
                            animNames[i]
                        ],
                        "transitions": [
                            {
                                "default": "query.any_animation_finished"
                            }
                        ]
                    }
                })

            create(
                {
                    [anim.trigger_event]: {
                        "add": {
                            "component_groups": [
                                `bridge:event_animation_${i + offset}`
                            ]
                        }
                    }
                },
                'minecraft:entity/events'
            )

        })

        animationController(
            {
                "initial_state": "default",
                "states": {
                    "default": {
                        "transitions": animTransitions
                    },
                    ...animobj
                }
            }
        )
    })

}