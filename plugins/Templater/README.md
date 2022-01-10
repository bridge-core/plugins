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
        "namespace:id2"
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
        },
        "components" : {
            "minecraft:foo" : {
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
        },
        "components" : {
            "minecraft:foo" : {
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
        },
        "components" : {
            "minecraft:foo" : {
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

## Variables

Templates support variables. For example a template could look like this:

```json
{
    "is_template" : true,
    "format_version": "...",
    "minecraft:entity": {
        "description": {
            "identifier": "namespace:template"
        },
        "components" : {
            "minecraft:foo" : {
                "bar" : "${BAR_VAL}"
            },
            "minecraft:baz" : true,
            "minecraft:some_property" : "${SOME_PROP}"
        },
        "events" : {
            "${NAMESPACE}:${NAME}_init_event" : {
                "add" : {
                    ...
                }
            }
        }
    }
}	
```

There are three variables that are always defined: `NAMESPACE`, which corresponds to the object (not necessarily project) namespace,
`NAME`, which corresponds to the object name (string after the `:`), `IDENTIFIER`, which is just the full identifier of the object. 
We can have any json type as a value for variables: primitives, objects or arrays. We can instantiate variables like this:

```json
{
    "variables" : {
        "BAR_VAL" : 42,
        "SOME_PROP" : {
            "thing" : true
        }
    },
    "template" 
    "format_version": "...",
    "minecraft:entity": {
        "description": {
            "identifier": "namespace:instance"
        }
    }
}	
```

The resulting file would be:


```json
{
    "format_version": "...",
    "minecraft:entity": {
        "description": {
            "identifier": "namespace:instance"
        },
        "components" : {
            "minecraft:foo" : {
                "bar" : 42
            },
            "minecraft:baz" : true,
            "minecraft:some_property" : {
                "thing" : true
            }
        },
        "events" : {
            "namespace:instance_init_event" : {
                "add" : {
                    ...
                }
            }
        }
    }
}	
```

Templates can also include variables, and variables can be defined multiple times. However, only the variable value with the highest priority is used. The 1. Priority is always the
instance file itself, then the included templates in order of appearance. The three predefined variables cannot be overwritten.

Therefore, it is recommended that templates include default values for their variables, unless they're necessarily supposed to be customized. This could look like this:

```json
{
    "is_template" : true,
    "variables" : {
        "HEALTH" : 20.0
    },
    "format_version": "...",
    "minecraft:entity": {
        "description": {
            "identifier": "namespace:template"
        },
        "components" : {
            "minecraft:health" : {
                "value" : "${HEALTH}"
            }
        }
    }
}	
```