export default defineComponent(({ name, template, schema }) => {
	name('bridge:switchable_visuals')
	schema({
		description: 'Allows to switch between multiple geometries & textures based on a block property value.',
		type: 'object',
		required: [ 'property', 'geometry_firstname', 'visuals' ],
		properties: {
			property: {
				description: `Sets the property to use.`,
				type: 'string'
			},
			geometry_firstname: {
				description: 'Specifies the geometry definition name to use as a first name before geometry_lastname.',
				type: 'string'
			},
			visuals: {
				description: 'Defines the geometries & textures.',
				type: 'array',
				items: {
					type: 'object',
					properties: {
						geometry_lastname: {
							description: 'Last name of the geometry.',
							type: 'string'
						},
						collision: {
							description: 'Collision of the geometry.',
							type: 'object',
							properties: {
								pick: {
									description: 'Uses both origin and size. When set to false, collision gets disabled.',
									type: [ 'array', 'boolean' ]
								},
								entity: {
									description: 'Uses both origin and size. When set to false, collision gets disabled.',
									type: [ 'array', 'boolean' ]
								}
							}
						},
						texture: {
							description: 'Name of a texture from the terrain_texture.json file.',
							type: 'string'
						},
						render_method: {
							description: 'Method to use for rendering this face.',
							enum: [ 'opaque', 'blend', 'alpha_test', 'double_sided' ]
						},
						ambient_occlusion: { type: 'boolean' },
						face_dimming: { type: 'boolean' }
					}
				}
			}
		}
	})

	template(({ property, geometry_firstname, visuals }, { create }) => {

		const createNumberArray = number => [...Array(number).keys()]

		create(
			{
				[property]: createNumberArray(visuals.length)
			},
			'minecraft:block/description/properties'
		)

		create(
			{
				permutations: visuals.map((visual, i) => ({
					condition: `q.block_property('${property}') == ${i}`,
					components: {
						'minecraft:geometry': `geometry.${geometry_firstname}.${visual.geometry_lastname}`,
						'minecraft:pick_collision': (visual.collision.pick === false ? false : {
							origin: visual.collision.pick.slice(0, 3),
							size: visual.collision.pick.slice(3, 6)
						}),
						'minecraft:entity_collision': (visual.collision.entity === false ? false : {
							origin: visual.collision.entity.slice(0, 3),
							size: visual.collision.entity.slice(3, 6)
						}),
						'minecraft:material_instances': {
							'*': {
								texture: visual.texture,
								render_method: visual.render_method,
								ambient_occlusion: visual.ambient_occlusion,
								face_dimming: visual.face_dimming
							}
						}
					}
				}))
			},
			'minecraft:block'
		)
	})
})
