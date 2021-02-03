Install the extension and then add the `comMojangRewrite` compiler plugin to your build config.

```json
{
	"plugins": {
		"*": [
			[
				"comMojangRewrite",
				{ "packName": "MyPack", "buildName": "build_1" }
			]
		]
	}
}
```
