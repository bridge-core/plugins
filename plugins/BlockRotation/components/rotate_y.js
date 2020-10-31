Bridge.register(class Component {
	static component_name = 'bridge:rotate_y_on_place'
	static type = 'block'

	onApply({ flip = false }) {
		const rotationLookup = [[0.0,0.0, 0.0], [0.0, 180.0, 0.0], [0.0, 90.0, 0.0],  [0.0, 270.0, 0.0]]
		const rotationLookupFlipped = [[0.0,180.0, 0.0], [0.0, 0.0, 0.0], [0.0, 270.0, 0.0],  [0.0, 90.0, 0.0]]
		return {
			'minecraft:block': {
				description: {
					properties: {
						'bridge:block_rotation': [2, 3, 4, 5]
					}
				},
				permutations: (flip ? rotationLookupFlipped : rotationLookup).map((rotation, i) => ({
					condition: `query.block_property('bridge:block_rotation') == ${i + 2}`,
					components: {
						"minecraft:rotation": rotation
					}
				})),
				components: {
					'minecraft:on_player_placing': {
						event: 'bridge:update_rotation'
					}
				},
				events: {
					'bridge:update_rotation': {
						set_block_property: {
							'bridge:block_rotation': 'query.cardinal_facing_2d'
						}
					}
				}
			}
		}
	}
	onPropose() {
		return {
			[Component.component_name]: {
				flip: '$general.boolean'
			}
		}
	}
})