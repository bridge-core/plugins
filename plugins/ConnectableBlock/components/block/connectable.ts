const directions = ['north', 'east', 'south', 'west', 'up', 'down', 'north_up', 'east_up', 'south_up', 'west_up', 'north_down', 'east_down', 'south_down', 'west_down'];
export default defineComponent(({ name, template, schema }) => {
	name('bridge:connectable')
	schema({
		description: 'Allows the block to connect to neighboring blocks. Note: Requires format_version to be 1.20.60!',
		type: 'object',
		anyOf: [
			{ required: ['tag', 'directions', 'parts'] },
			{ required: ['tag', 'directions', 'geometries'] }
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
					enum: directions
				}
			},
			parts: {
				description: 'The part_visiblity method | Defines when to hide specific parts of the geometry. Not compatible with the "geometries" method.',
				type: 'array',
				items: {
					type: 'object',
					anyOf: [
						{ required: ['name', 'directions'] },
						{ required: ['name', 'direction_combinations'] }
					],
					properties: {
						name: {
							description: 'Name of the bone.',
							type: 'string'
						},
						directions: {
							description: 'Specifies when to show the part. Multiple directions can be passed.',
							type: 'array',
							items: {
								type: 'string',
								enum: directions
							}
						},
						direction_combinations: {
							description: 'Specifies when to show the part. Multiple directions combinations can be passed. Does an AND between the directions in inside of the array and an OR between the arrays',
							type: 'array',
							items: {
								type: 'array',
								items: {
									type: 'string',
									enum: directions
								}
							}
						},
						inverted: {
							description: 'Specifies to invert the check',
							type: 'boolean'
						}
					}
				}
			},
			geometries: {
				description: 'The geometries method | Defines a list of geometries and when to hide each one. Not compatible with the "part_visiblity" method.',
				type: 'array',
				items: {
					type: 'object',
					anyOf: [
						{ required: ['name', 'directions', 'material_instances'] },
						{ required: ['name', 'direction_combinations', 'material_instances'] }
					],
					properties: {
						name: {
							description: 'Definition name of the geometry.',
							type: 'string'
						},
						directions: {
							description: 'Specifies when to show the geometry. Multiple directions can be passed.',
							type: 'array',
							items: {
								type: 'string',
								enum: directions
							}
						},
						direction_combinations: {
							description: 'Specifies when to show the geometry. Multiple directions can be passed. Does an AND between the directions in inside of the array and an OR between the arrays',
							type: 'array',
							items: {
								type: 'string',
								enum: directions
							}
						},
						material_instances: {
							$ref: '/data/packages/minecraftBedrock/schema/block/v1.16.100/components/material_instances.json'
						},
						inverted: {
							description: 'Specifies to invert the check',
							type: 'boolean'
						}
					}
				}
			}
		}
	})

	template(({ tag, directions, parts = [], geometries = [] }: { tag: string, directions: string[], parts: any, geometries: any }, { create, sourceBlock }) => {
		const positions = new Map([
			['north', [0, 0, -1]],
			['east', [1, 0, 0]],
			['south', [0, 0, 1]],
			['west', [-1, 0, 0]],
			['up', [0, 1, 0]],
			['down', [0, -1, 0]],
			['north_up', [0, 1, -1]],
			['east_up', [1, 1, 0]],
			['south_up', [0, 1, 1]],
			['west_up', [-1, 1, 0]],
			['north_down', [0, -1, -1]],
			['east_down', [1, -1, 0]],
			['south_down', [0, -1, 1]],
			['west_down', [-1, -1, 0]],
		])

		directions.map((dir: string) => {
			create(
				{
					[`bridge:${dir}_neighbor`]: [false, true]
				},
				'minecraft:block/description/states'
			)
		})

		function getQueryStringForPartOrGeometry(part_or_geo: { directions: string[] | undefined, direction_combinations: string[][] | undefined, inverted: boolean | undefined }) {
			return (part_or_geo.inverted ? "!(" : "") + (
				part_or_geo.directions ? (
					part_or_geo.directions.length === 1 ?
						`q.block_state('bridge:${part_or_geo.directions}_neighbor')==true`
						:
						`${part_or_geo.directions.map((dir: string) => `q.block_state('bridge:${dir}_neighbor')==true`).join('&&')}`
				)
					:
					(
						part_or_geo.direction_combinations.length === 1 ?
							`${part_or_geo.direction_combinations[0].map((dir: string) => `q.block_state('bridge:${dir}_neighbor')==true`)}`
							:
							`${part_or_geo.direction_combinations.map((dirs: string[]) => dirs.map((dir: string) => `q.block_state('bridge:${dir}_neighbor')==true`).join('&&')).join('||')}`
					)
			) + (part_or_geo.inverted ? ")" : "")
		}
		if (parts) {
			parts.map((part: { name: string, directions: string[] | undefined, direction_combinations: string[][] | undefined, inverted: boolean | undefined }) => {
				create(
					{
						[part.name]: getQueryStringForPartOrGeometry(part)
					},
					'minecraft:block/components/minecraft:geometry/bone_visibility'
				)
			})
		}

		if (geometries) {
			create(
				{
					permutations: geometries.map((geo: { name: string, directions: string[] | undefined, direction_combinations: string[][] | undefined, material_instances: any, inverted: boolean | undefined }) => ({
						condition: getQueryStringForPartOrGeometry(geo),
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
				'minecraft:queued_ticking': {
					looping: true,
					interval_range: [0, 0],
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
				'minecraft:block/events/e:update.neighbors/set_block_state'
			)
		})
	})
})
