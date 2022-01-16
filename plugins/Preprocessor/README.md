# JavaScript Preprocessor Plugin

## Description

This compiler plugin allows you to write rudimentary JavaScript inside of JSON files, and have that JavaScript executed at compile time. The JavaScript code can primarily be used to generate JSON elements and objects, but is technically able to do anything that regular JavaScript can. You can even define (per-file) global scripts, with values that can be changed or common functions to be used.

## Installing

1. Download the plugin from the Extension Store.

2. Add `preprocessor` to your compiler path by editing the project `config.json`. You are going to want to include it before basically anything else, in particular before `customComponents` and `templater`. I suggest inserting it after `typeScript`. 

## Supported File Types:

Any JSON file is supported.

## Usage

There's two types of JSON Elements: JSON objects, and JSON values. Similarly, we can have a script be interpreted as a value, or as an object. 

### Value Expressions

If we want our JS to be evaluated as a value, we need to assign it to a property: 

```json
{
    "some_prop" : [
        ...
    ]
}
```

Every JS evaluation is an array of strings, other elements are not permitted. For Value Expressions, the first element of the array **MUST** be the string `$eval`. Everything that follows in the array will be read as one line of JS code. As an example:

```json
{
    "some_prop" : [
        "$eval",
        "let a = 10;",
        "let b = 5;",
        "let x = a * Math.pow(b, 2);"
    ]
}
```

This will be calculated, but doesn't produce any JSON output. If we want output, we call the builtin `json()` function, like this:

```json
{
    "some_prop" : [
        "$eval",
        "let a = 10;",
        "let b = 5;",
        "let x = a * Math.pow(b, 2);",
        "json(x);"
    ]
}
```

The compiled file looks like this:

```json
{
    "some_prop" : 250
}
```

The `json()` function takes anything as input that could be serialized to JSON; numbers, strings, booleans, objects, arrays, null. Some more examples:

```json
{
    "some_prop" : [
        "$eval",
        "json({other_prop : Math.pow(2,10)});"
    ]
}
```

results in:

```json
{
    "some_prop" : {
        "other_prop" : 1024
    }
}
```

similarly,

```json
{
    "some_prop" : [
        "$eval",
        "json(['bob', 'alice', 'joe']);"
    ]
}
```

results in:

```json
{
    "some_prop" : [
        "bob",
        "alice",
        "joe"
    ]
}
```

#### Special Case: Arrays

For value expressions, the `json()` function can normally only be called once. All later calls override previously set values. This is the case for all values, except for expressions used inside arrays. For example:

```json
{
    "long_array" : [
        1,
        2,
        3,
        [
            "$eval",
            "for(let k = 4; k <= 10; k++){",
            "json(k);",
            "}"
        ],
        100
    ]
}
```

Note how here, the array of the expression to be evaluated is actually an element of the value array itself. This code results in:

```json
{
    "long_array" : [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        100
    ]
}
```

### Object Expressions

The syntax for object expressions is a bit different: We don't need a property name, but the `json()` function expects to always be given a JS object with some properties. The basic syntax is as follows:

```json
{
    "$eval" : [
        ...
    ]
}
```

As you can see, the `$eval` is actually the property name here, and it is **NOT ALLOWED** to have an `$eval` inside of the array. As mentioned, the `json()` function only accepts a JS object with some properties in this mode. Let's look at an example:

```json
{
    "$eval": [
        "for(let i = 0; i < 5; i++) {",
        "json({",
        "['test:my_object' + i] : {var : i}",
        "});",
        "}"
    ]
}
```

The syntax is not pretty, but we sadly can't do indentation in JSON strings. Nevertheless, the output would be this:

```json
{
    "test:my_object0": {
        "var": 0
    },
    "test:my_object1": {
        "var": 1
    },
    "test:my_object2": {
        "var": 2
    },
    "test:my_object3": {
        "var": 3
    },
    "test:my_object4": {
        "var": 4
    }
}
```

This is super useful when generating events or component groups for different variants of entities.

### Global Scripts

Global Scripts are global for each file, not for the entire workspace. This means that every global file is executed once (and only once) before all of the expressions in the file are evaluated. To include global scripts, add the following property to the root JSON element:

```json
{
    "include_scripts" : [
        ...
    ]
}
```

Inside the array, there are names of scripts that will be executed. They are executed in the order that they're listed. All names must end with a `.js` and be relative to a BP folder called `preprocessor_scripts`. So for my example, I have a script with the path `BP/preprocessor_scripts/globals.js`. This would be included like:

```json
{
    "include_scripts" : [
        "globals.js"
    ]
}
```

Since they are run once per file, the variables that are declared in there can be redefined by expressions of the file itself, which can be quite useful. 

It is recommended to write all larger expressions in a function inside a global script, and then simply to call that function from the JSON file itself. **NOTE HOWEVER** that the `json()` function is not in scope for global files. This means that you must pass the `json()` function as an argument to all functions that you wish to use it in. I'm afraid there's no other workaround for this. You could also just use the return value of your functions and then use that inside a `json()` inside of your JSON file. As an example for the previous object expression, we would write this code in `globals.js`: 

```js
function things(json) {
    for (let i = 0; i < 5; i++) {
        json({
            ['test:my_object' + i]: { var: i }
        });
    }
}
```

and the following code in the JSON file:

```json
{
    "include_scripts" : [
        "globals.js"
    ],
    "$eval": [
        "things(json);"
    ]
}
```

Which results in the same object code we saw above.