const rotationLookup = new Map([
	['down', [-90.0, 0.0, 0.0]],
	['up', [90.0, 0.0, 0.0]],
	['north', [0.0, 0.0, 0.0]],
	['west', [0.0, 90.0, 0.0]],
	['south', [0.0, 180.0, 0.0]],
	['east', [0.0, -90.0, 0.0]],
]);
export default function defineComponent({ name, template, schema }) {
	name('bridge:rotate_on_place')
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
			? 'cardinal_direction'
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
				permutations: Array.from(rotationLookup.entries()).map(([name, rotation]) => ({
					condition: `q.block_state('minecraft:${state}') == '${name}'`,
					components: {
						'minecraft:transformation': {
							rotation,
						},
					},
				})),
			},
			'minecraft:block'
		);
	})
}
