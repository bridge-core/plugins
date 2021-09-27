export default defineComponent(({ name, template, schema }) => {
	name('bridge:connectable')
	schema({
		description: 'Allows the block to connect to neighboring blocks.',
		type: 'object',
		anyOf: [
			{ required: [ 'tag', 'directions', 'parts' ] },
			{ required: [ 'tag', 'directions', 'geometries' ] }
		],
		properties: {
			tag: {
				description: 'The neighbor block tag.',
				type: 'string'
			},
			directions: {
				description: 'Outlines which directions can be connected to.',
				type: 'array',
				items: {
					type: 'string',
					enum: [ 'north', 'east', 'south', 'west', 'up', 'down' ]
				}
			},
			parts: {
				description: 'part_visiblity method | Defines when to hide specific parts of the geometry. Not compatible with the "geometries" method.',
				type: 'object',
				additionalProperties: false,
				patternProperties: {
					'^[a-z0-9_-]+$': {
						description: 'Bone name.',
						enum: [ 'north', 'east', 'south', 'west', 'up', 'down' ]
					}
				}
			},
			geometries: {
				description: 'geometries method | Defines a list of geometries and when to hide each one. Not compatible with the "part_visiblity" method.',
				type: 'array',
				items: {
					type: 'object',
					properties: {
						name: {
							description: 'Definition name of the geometry.',
							type: 'string'
						},
						directions: {
							description: 'When to show the geometry. Multiple directions can be passed.',
							type: 'array',
							items: { enum: [ 'north', 'east', 'south', 'west', 'up', 'down' ] }
						}
					}
				}
			}
		}
	})

	template(({ tag, directions, parts = {}, geometries = [] }:{ tag: string, directions: string[], parts: any, geometries: any }, { create, identifier }) => {

		const positions = new Map([
			[ 'north', [ 0, 0, -1 ] ],
			[ 'east', [ 1, 0, 0 ] ],
			[ 'south', [ 0, 0, 1 ] ],
			[ 'west', [ -1, 0, 0 ] ],
			[ 'up', [ 0, 1, 0 ] ],
			[ 'down', [ 0, -1, 0 ] ]
		])

		directions.map((dir: string) => {
			create(
				{
					[`bridge:${dir}_neighbor`]: [ false, true ]
				},
				'minecraft:block/description/properties'
			)
		})

		if (parts) {
			for (const [bone, dir] of Object.entries(parts)) {
				create(
					{
						[bone]: `q.block_property('bridge:${dir}_neighbor')`
					},
					'minecraft:block/components/minecraft:part_visibility/rules'
				)
			}
		}
		if (geometries) {
			create(
				{
					permutations: geometries.map(geo => ({
						...(geo.directions.length === 1 ? {
							condition: `q.block_property('bridge:${geo.directions}_neighbor')`
						} : {
							condition: `${geo.directions.map((dir: string) => `q.block_property('bridge:${dir}_neighbor')`).join('&&')}`
						}),
						components: {
							'minecraft:geometry': geo.name
						}
					}))
				},
				'minecraft:block'
			)
		}

		create(
			{
				'minecraft:ticking': {
					looping: true,
					range: [ 0, 0 ],
					on_tick: {
						event: 'e:update.neighbors'
					}
				}
			},
			'minecraft:block/components'
		)

		directions.map((dir: string) => {
			create(
				{
					[`bridge:${dir}_neighbor`]: `q.block_neighbor_has_any_tag(${positions.get(dir)}, '${tag}') ? true : false`
				},
				'minecraft:block/events/e:update.neighbors/set_block_property'
			)
		})
	})
})
