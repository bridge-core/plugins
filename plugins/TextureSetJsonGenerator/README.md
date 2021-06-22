# Minecraft Texture Set Generator

> See [Minecraft's Texture Set Documentation](https://help.minecraft.net/hc/en-us/articles/360051308931-Minecraft-Texture-Set-Documentation) for more details about `.texture_set.json` files.

## [bridge.](https://bridge-core.github.io/) Plugin

### Usage

#### Enter texture name in search bar.

  - A list of terrain texture names is loaded into a auto-complete list.

#### Optionally customize texture set output

  - Base layer, MER layer, and normal map layers are automatically filled to match terrain texture name in the search bar.

  - Layer values can be individually modified by changing the _Base layer_, _MER map_ and _Depth map_ fields.

  - The automatically-filled texture name remains in the auto-completion list.

  - Base layer and MER layers can use a uniform color instead of a terrain texture name. Click the paint bucket icon to open a color picker.

  > **TODO:**
  > Allow user to specify uniform color's output format.

  - Specify if the depth map is a normal map (default) or a heightmap by selecting a value from the dropdown menu next to the field.

  - Leave a field's value empty to omit the layer from the texture set output.

#### Save texture set output

  - Click the _Save_ button to save the generated `.texture_set.json` file to the resource pack `textures/blocks/` directory.
