Install the extension and then add the `jsonEncoder` compiler plugin to your build config.

```json
{
    "plugins": [
        [
            "comMojangRewrite",
            {
                "packName": "BridgeTest"
            }
        ],
        "jsonEncoder",
        "loadJSON"
    ]
}

```
