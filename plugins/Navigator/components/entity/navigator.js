export default defineComponent(({ name, template, schema }) => {
	name('bridge:navigator')
	schema({
		type: 'object',
		additionalProperties: false,
		properties: {
			paths: {
				type: 'array',
				description: "Paths",
				items: {
					type: 'object',
					additionalProperties: false,
					properties: {
						priority: {
							type: "integer",
							description: "Priority of the generated tasks"
						},
						start_event: {
							$ref: "/data/packages/minecraftBedrock/schema/entity/dynamic/currentContext/eventEnum.json",
							description: "Event that starts the entity's pathing"
						},
						stop_event: {
							$ref: "/data/packages/minecraftBedrock/schema/entity/dynamic/currentContext/eventEnum.json",
							description: "Event that stops this path"
						},
						speed_multiplier: {
							type: "number",
							description: "Speed multiplier while pathing"
						},
						tick_interval: {
							type: "number",
							description: "The tick interval of the tasks"
						},
						start_chance: {
							type: "number",
							description: "The chance that the pathing starts"
						},
						search_range: {
							type: "number",
							description: "The horizontal search range for target blocks"
						},
						search_height: {
							type: "number",
							description: "The vertical search range for target blocks"
						},
						goal_radius: {
							type: "number",
							description: "The radius around the target position where the entity will consider the target reached"
						},
						loop: {
							type: "boolean",
							description: "If the entity should loop to the start again after completing the path"
						},
						global_stay_duration: {
							type: "number",
							description: "Global stay duration at each path point (should be nonzero)"
						},
						target_selection_method: {
							type: "string",
							enum: ["nearest", "random"],
							description: "Target selection method"
						},
						global_offset: {
							type: "array",
							minItems: 3,
							maxItems: 3,
							items: {
								type: "number"
							},
							description: "Global offset from the target position. Currently seems to only work for an offset of at most 1 block."
						},
						path_points: {
							type: "array",
							description: "The target blocks on the path that the entity should visit. The order in the array defines the order of the points visited for the entity.",
							items: {
								anyOf: [
									{
										$ref: "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/block_identifiers",
										description: "The block to target. Will not trigger any special events when reached, and uses global offset and stay duration."
									},
									{
										type: "object",
										additionalProperties: false,
										properties: {
											block: {
												$ref: "/data/packages/minecraftBedrock/schema/general/reference/identifiers.json#/definitions/block_identifiers",
												description: "The block to target"
											},
											on_reach: {

												description: "The event(s) to trigger when reaching the block",
												anyOf: [
													{
														$ref: "/data/packages/minecraftBedrock/schema/entity/general/v1.16.0/eventDefinition.json"
													},
													{
														type: "array",
														items: {
															$ref: "/data/packages/minecraftBedrock/schema/entity/general/v1.16.0/eventDefinition.json"
														}
													}
												]
											},
											on_stay_completed: {

												description: "The event(s) to trigger when the stay is completed",
												anyOf: [
													{
														$ref: "/data/packages/minecraftBedrock/schema/entity/general/v1.16.0/eventDefinition.json"
													},
													{
														type: "array",
														items: {
															$ref: "/data/packages/minecraftBedrock/schema/entity/general/v1.16.0/eventDefinition.json"
														}
													}
												]
											},
											offset: {
												type: "array",
												minItems: 3,
												maxItems: 3,
												items: {
													type: "number"
												},
												description: "The target offset override. When this is set, this will be used instead of the global offset."
											},
											stay_duration: {
												type: "number",
												description: "The stay duration override. When this is set, this will be used instead of the global stay duration."
											}
										}
									}

								]
							}
						}
					}
				}
			},
			stop_event: {
				$ref: "/data/packages/minecraftBedrock/schema/entity/dynamic/currentContext/eventEnum.json",
				description: "Event that stops all paths. If this is unset, it will be bridge:stop_all_paths"
			}
		}
	})

	template(({ paths, stop_event }, { create }) => {
		if (!stop_event)
			stop_event = "bridge:stop_all_paths"

		paths.forEach((path, i) => {
			path.path_points.forEach((point, j) => {
				create(
					{
						[`bridge:path_${i}_${j}`]: {
							"minecraft:behavior.move_to_block": {
								priority: path.priority,
								speed_multiplier: path.speed_multiplier,
								tick_interval: path.tick_interval,
								start_chance: path.start_chance,
								search_range: path.search_range,
								search_height: path.search_height,
								goal_radius: path.goal_radius,
								stay_duration: point.stay_duration ? point.stay_duration : path.global_stay_duration,
								target_selection_method: path.target_selection_method,
								target_offset: point.offset ? point.offset : path.global_offset,
								target_blocks: [point.block ? point.block : point],
								on_reach: point.on_reach,
								on_stay_completed: [{ "event": j + 1 == path.path_points.length ? (path.loop ? `bridge:navigate_to_${i}_0` : `bridge:stop_path_${i}`) : `bridge:navigate_to_${i}_${j + 1}`, "target": "self" }].concat(point.on_stay_completed ? point.on_stay_completed : [])
							}
						}
					},
					'minecraft:entity/component_groups'
				)

				create(
					{
						[`bridge:navigate_to_${i}_${j}`]: {
							"sequence": [
								j == 0 && !path.loop ? {} :
									{
										"remove": {
											"component_groups": [
												j == 0 ? `bridge:path_${i}_${path.path_points.length - 1}` : `bridge:path_${i}_${j - 1}`
											]
										}
									},
								{
									"add": {
										"component_groups": [
											`bridge:path_${i}_${j}`
										]
									}
								}
							]
						}
					},
					'minecraft:entity/events'
				)

				create(
					{
						[stop_event]: {
							"remove": {
								"component_groups": [
									`bridge:path_${i}_${j}`
								]
							}
						},
						[`bridge:stop_path_${i}`]: {
							"remove": {
								"component_groups": [
									`bridge:path_${i}_${j}`
								]
							}
						}
					},
					'minecraft:entity/events'
				)

				if (path.stop_event) {
					create(
						{
							[path.stop_event]: {
								"remove": {
									"component_groups": [
										`bridge:path_${i}_${j}`
									]
								}
							}
						},
						'minecraft:entity/events'
					)
				}
			})

			create(
				{
					[path.start_event]: {
						"add": {
							"component_groups": [
								`bridge:path_${i}_0`
							]
						}
					}
				},
				'minecraft:entity/events'
			)
		})
	})
})
