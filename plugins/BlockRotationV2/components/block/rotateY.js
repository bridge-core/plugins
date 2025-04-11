const rotationLookup = new Map([
	['north', [0.0, 0.0, 0.0]],
	['south', [0.0, 180.0, 0.0]],
	['west', [0.0, 90.0, 0.0]],
	['east', [0.0, -90.0, 0.0]],
]);
const rotationLookupFlipped = new Map([
	['north', [0.0, 180.0, 0.0]],
	['south', [0.0, 0.0, 0.0]],
	['west', [0.0, -90.0, 0.0]],
	['east', [0.0, 90.0, 0.0]],
]);
export default function defineComponent({ name, template, schema }) {
	name('bridge:rotate_y_on_place')
	schema({
		properties: {
			flip: {
				type: 'boolean',
			},
		},
	})

	template(({ flip = false }, { create }) => {
		create(
			{
				'minecraft:placement_direction': {
					enabled_states: [
						'minecraft:cardinal_direction'
					],
					y_rotation_offset: 180 // Face towards player
				},
			},
			'minecraft:block/description/traits'
		);

		create(
			{
				permutations: Array.from((flip
					? rotationLookupFlipped
					: rotationLookup
				).entries).map(([name, rotation]) => ({
					condition: `q.block_state('minecraft:cardinal_direction') == '${name}'`,
					components: {
						'minecraft:transformation': {
							rotation
						}
					},
				})),
			},
			'minecraft:block'
		)
	})
}
