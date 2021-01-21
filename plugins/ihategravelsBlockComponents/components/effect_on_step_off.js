Bridge.register(
	class BlockComponent {
		static component_name = 'bridge:effect_on_step_off'
		static type = 'block'

		onApply({ effect, target, duration, amplifier, condition }) {
			return {
				'minecraft:block': {
                    events: {
                        'bridge:effect_on_step_off': {
                            'add_mob_effect': {
                                'effect': effect,
                                'target': target,
                                'duration': duration,
                                'amplifier': amplifier
                            }
                        }
                    },
					components: {
                        'minecraft:on_step_off': {
                            'event': "bridge:effect_on_step_off",
                            'condition': condition
                        }
					},
				},
			}
		}

		onPropose() {
			return {
				[BlockComponent.component_name]: {
					effect: '$general.effect_name',
                    duration: '$general.number',
                    amplifier: '$general.number',
                    condition: '$molang.embedded',
                    target: ["self","other"]
				  }
			}
		}
	}
)