import { world } from "@minecraft/server";

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
]);

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "bridge:connectable",
        /** @type {import("@minecraft/server").BlockCustomComponent} */
        {
            onTick({ block }) {
                const tag = block.permutation.getState("bridge:connectable");
                if (!tag) return;
                for (const [dir, pos] of positions) {
                    try {
                        block.setPermutation(
                            block.permutation.withState(
                                `bridge:${dir}_neighbor`,
                                block.offset({ x: pos[0], y: pos[1], z: pos[2] })?.hasTag(tag)
                            )
                        );
                    } catch {
                        // user can remove directions, so then it will give an error
                    }
                }
            },
        }
    );
});
