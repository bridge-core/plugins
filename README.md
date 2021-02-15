# bridge. - Plugins
A collection of plugins for bridge. which automatically appear inside the editor itself. Feel free to add your own ones with a pull request!

## Contributing plugins
_Before adding your plugin to the repository please ensure that the plugin is working._

To add your plugin, drag the plugin's folder into the `plugins` folder.
Once the pull request is merged, it will **automatically create a zip file** for the plugin and will add it to the plugins.json or extensions.json file so you DO NOT need to do this yourself.

**Ensure your plugin manifest contains the following information:**
- `"author"`
- `"name"`
- `"version"`
- `"id"`
- `"description"`
- `"tags"`

Properties not listed here are optional.

If you're contributing a plugin for bridge. v2, set the `"target"` property in the plugin manifest to `"v2"` or `"both"` if the plugin is compatible with both versions. If this isn't specified, it will default to `"v1"`.