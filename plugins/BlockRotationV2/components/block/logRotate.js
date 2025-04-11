export default function defineComponent({ name, template, schema }) {
	name('bridge:log_rotate_on_place')
	schema({
		properties: {
			rotation_from: {
				type: 'string',
				enum: ['player', 'block_face'],
			},
		},
	})

	template(({ rotation_from = 'player' }, { create }) => {
		const state = rotation_from === 'player'
			? 'cardinal_facing'
			: 'block_face';

		create(
			{
				'minecraft:placement_direction': {
					enabled_states: [
						`minecraft:${state}`
					],
					...(state === 'cardinal_direction' ? { y_rotation_offset: 180 } : {})
				},
			},
			'minecraft:block/description/traits'
		);

		create(
			{
				permutations: [
					// X axis
					{
						condition: `q.block_state('minecraft:${state}') == 'west' || q.block_state('minecraft:${state}') == 'east'`,
						components: {
							"minecraft:transformation": { rotation: [0, 0, 90] }
						}
					},
					// Y axis
					{
						condition: `q.block_state('minecraft:${state}') == 'down' || q.block_state('minecraft:${state}') == 'up'`,
						components: {
							"minecraft:transformation": { rotation: [0, 0, 0] }
						}
					},
					// Z axis
					{
						condition: `q.block_state('minecraft:${state}') == 'north' || q.block_state('minecraft:${state}') == 'south'`,
						components: {
							"minecraft:transformation": { rotation: [90, 0, 0] }
						}
					}
				]
			},
			'minecraft:block'
		)
	})
}
