Bridge.register(
	class BlockComponent {
		static component_name = 'bridge:command_on_interact'
		static type = 'block'

		onApply({ target, condition, command }) {
			return {
				'minecraft:block': {
                    events: {
                        'bridge:command_on_interact': {
                                'run_command': {
                                    "command": command,
                                    'target': target
                            }
                        }
                    },
					components: {
                        'minecraft:on_interact': {
                            'event': "bridge:command_on_interact",
                            'condition': condition
                        }
					},
				},
			}
		}

		onPropose() {
			return {
				[BlockComponent.component_name]: {
                    condition: '$molang.embedded',
					target: ["self","other"],
					command: {
						"$dynamic.list.next_index": "$function.embedded_no_slash"
					}
				  }
			}
		}
	}
)
