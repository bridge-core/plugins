# Convert OBJ

Convert OBJ is a compiler plugin for [Dash](https://github.com/bridge-core/dash-compiler) that converts OBJ files into the JSON format Minecraft understands.

## Usage

To add a new OBJ file to your project, simply add the file to your `RP/models/` folder. Place a corresponding texture with the same file name within the `RP/textures/obj/` folder (e.g. `my_model.obj` -> `my_model.png`).

You can now reference your new model as `<project namespace>:my_model` within your project.
