Bridge.register(class EntitySpawner {
    static component_name = "bridge:entity_spawner";

    onApply({ cooldown, spawn_entity, detection_range, spawn_delay }={}, location) {
        if (cooldown === undefined) cooldown = 360;
        if (detection_range === undefined) detection_range = 16;
        if (spawn_delay === undefined) spawn_delay = 0;
        if (spawn_entity === undefined) return {};

        const TEMPLATE = {
            "component_groups": {
                "bridge:spawner_cooldown": {
                    "minecraft:timer": {
                        "looping": false,
                        "time": cooldown,
                        "time_down_event": {
                            "event": "bridge:on_remove_cooldown"
                        }
                    }
                }
            },
            "events": {
                "bridge:on_spawn_entity": {
                    "add": {
                        "component_groups": [
                            "bridge:spawner_cooldown"
                        ],
                        "group": {
                            "name": "bridge:spawn_entity",
                            "components": {
                                "minecraft:spawn_entity": [{
                                    "min_wait_time": spawn_delay,
                                    "max_wait_time": spawn_delay,
                                    "single_use": false,
                                    "spawn_entity": spawn_entity
                                }]
                            }
                        }
                    }
                },
                "bridge:on_remove_cooldown": {
                    "remove": {
                        "component_groups": [
                            "bridge:spawner_cooldown"
                        ]
                    }
                }
            }
        };
        const SENSOR = {
            "minecraft:entity_sensor": {
                "sensor_range": detection_range,
                "minimum_count": 1,
                "event_filters": {
                    "all_of": [{
                            "test": "is_family",
                            "subject": "other",
                            "value": "player"
                        },
                        {
                            "test": "has_ability",
                            "operator": "not",
                            "subject": "other",
                            "value": "instabuild"
                        },
                        {
                            "test": "has_component",
                            "operator": "not",
                            "value": "minecraft:timer"
                        }
                    ]
                },
                "event": "bridge:on_spawn_entity"
            }
        };

        if(location === "components") {
            TEMPLATE.components = SENSOR;
        } else {
            TEMPLATE.component_groups[location] = SENSOR;
        }

        return {
            "minecraft:entity": TEMPLATE
        };
    }

    onPropose() {
        return {
            [EntitySpawner.component_name]: {
                "spawn_entity": "$general.entity_identifier",
                "detection_range": "$general.number",
                "cooldown": "$general.number",
                "spawn_delay": "$general.number"
            }
        }
    }
})