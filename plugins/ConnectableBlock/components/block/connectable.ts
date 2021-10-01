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
				description: 'The neighbor block tag which the component will test.',
				type: 'string'
			},
			directions: {
				description: 'Specifies which direction the component will use & create block properties for.',
				type: 'array',
				items: {
					type: 'string',
					enum: [ 'north', 'east', 'south', 'west', 'up', 'down' ]
				}
			},
			parts: {
				description: 'The part_visiblity method | Defines when to hide specific parts of the geometry. Not compatible with the "geometries" method.',
				type: 'array',
				items: {
					type: 'object',
					properties: {
						name: {
							description: 'Name of the bone.',
							type: 'string'
						},
						directions: {
							description: 'Specifies when to show the part. Multiple directions can be passed.',
							type: 'array',
							items: { enum: [ 'north', 'east', 'south', 'west', 'up', 'down' ] }
						}
					}
				}
			},
			geometries: {
				description: 'The geometries method | Defines a list of geometries and when to hide each one. Not compatible with the "part_visiblity" method.',
				type: 'array',
				items: {
					type: 'object',
					properties: {
						name: {
							description: 'Definition name of the geometry.',
							type: 'string'
						},
						directions: {
							description: 'Specifies when to show the geometry. Multiple directions can be passed.',
							type: 'array',
							items: { enum: [ 'north', 'east', 'south', 'west', 'up', 'down' ] }
						},
						material_instances: {
							$ref: '/data/packages/minecraftBedrock/schema/block/v1.16.100/components/material_instances.json'
						}
					}
				}
			}
		}
	})

	template(({ tag, directions, parts = [], geometries = [] }:{ tag: string, directions: string[], parts: any, geometries: any }, { create }) => {

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
			parts.map(part => {
				create(
					{
						...(part.directions.length === 1 ? {
							[part.name]: `q.block_property('bridge:${part.directions}_neighbor')`
						} : {
							[part.name]: `${part.directions.map((dir: string) => `q.block_property('bridge:${dir}_neighbor')`).join('&&')}`
						})
					},
					'minecraft:block/components/minecraft:part_visibility/rules'
				)
			})
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
							'minecraft:geometry': geo.name,
							'minecraft:material_instances': geo.material_instances
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
