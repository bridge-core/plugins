# Templater Compiler Plugin

## Description

This compiler plugin can create templated files and instantiate them, greatly reducing code redundancy and providing an inheritance structure.

## Installing

1. Download the plugin from the Extension Store.

2. Add `templater` to your compiler path by editing the project `config.json`. Depending on your purposes, you want to list it after `customXYZComponents`, because that will reduce file redundancy. If you do not care about that, you can have it after the `typeScript` plugin.

## Supported File Types:

- BP Entities
- RP Entities
- BP Blocks
- BP Items
- RP Items (technically supported, but bridge. doesn't seem to process the `transform` function for them for some reason)
- RP Particles

## Usage

If you have a supported file and want to make it a template, just add `"is_template" : true` at the root project structure, like this:

```json
{
	"is_template": true,
	"format_version": "...",
	"minecraft:entity": {
        "description" : {
            "identifier" : "namespace:id"
        }
		...
	}
}
```

It is important that the template has an identifier set.

Then, if you want to instantiate that template in a file, add `"include" : "namespace:id"` at the project root structure, like this:

```json
{
	"include": "namespace:id",
	"format_version": "...",
	"minecraft:entity": {
		"description": {
			"identifier": "namespace:instance"
		}
        ...
   	}
}		
```

You can even include multiple templates:

```json
{
	"include": [
		"namespace:id1",
		"namespace:id2",
	],
	"format_version": "...",
	"minecraft:entity": {
		"description": {
			"identifier": "namespace:instance"
		}
        ...
   	}
}		
```

Order matters: if we have these two templates:

```json
{
	"is_template": true,
	"format_version": "...",
	"minecraft:entity": {
        "description" : {
            "identifier" : "namespace:id1"
        }
		"components" : {
			"minecraft:foo" {
				"bar" : 10
            }
		}
	}
}
```

```json
{
	"is_template": true,
	"format_version": "...",
	"minecraft:entity": {
        "description" : {
            "identifier" : "namespace:id2"
        }
		"components" : {
			"minecraft:foo" {
				"bar" : 42
            },
    		"minecraft:baz" : true
		}
	}
}
```

Then the output of the example above will be:

```json
{
	"format_version": "...",
	"minecraft:entity": {
		"description": {
			"identifier": "namespace:instance"
		}
        "components" : {
			"minecraft:foo" {
				"bar" : 10
            },
    		"minecraft:baz" : true
		}
		...
   	}
}	
```

The first one takes precedence.

Templates can include other templates, but it is not recommended.

## Future Plans

I want to add support for custom variable instantiation, where an instanced file can define variables which will be replaced in the template.

