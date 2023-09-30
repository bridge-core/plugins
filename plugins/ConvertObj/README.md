# Convert OBJ

Convert OBJ is a compiler plugin for [Dash](https://github.com/bridge-core/dash-compiler) that converts OBJ files into the JSON format Minecraft understands.

## Installation

After installing the plugin from bridge.'s extension store, edit your project config to include the "convertObj" compiler plugin:

```
{
  ...
  "compiler": {
    "plugins": [
      ...,
      "convertObj",
      "simpleRewrite"
    ]
  }
}
```

## Usage

To add a new OBJ file to your project, simply add the file to your `RP/models/` folder. Place a corresponding texture with the same file name within the `RP/textures/obj/` folder (e.g. `my_model.obj` -> `my_model.png`).

You can now reference your new model as `geometry.<project namespace>.my_model` within your project.
