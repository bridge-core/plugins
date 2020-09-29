Bridge.register(class Component {
	static component_name = 'bridge:log_rotate_on_place'
	static type = 'block'

	onApply({ rotation_from = 'player' }) {
		const rotationLookup = [[0.0, 0.0, 0.0], [90.0, 0.0, 0.0], [0.0, 0.0, 90.0]]
		return {
			'minecraft:block': {
				description: {
					properties: {
						'bridge:block_rotation': [0, 1, 2]
					}
				},
				permutations: rotationLookup.map((rotation, i) => ({
					condition: `query.block_property('bridge:block_rotation') == ${i}`,
					components: {
						"minecraft:rotation" : rotation
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
							'bridge:block_rotation': `Math.floor(${rotation_from === 'player' ? 'query.cardinal_player_facing' : 'query.cardinal_block_face_placed_on'} / 2)`
						}
					}
				}
			}
		}
	}
	onPropose() {
		return {
			[Component.component_name]: {
				rotation_from: ['player', 'block_face']
			}
		}
	}
})