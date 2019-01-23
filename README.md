[![NPM](https://img.shields.io/npm/v/eznv.svg)](https://www.npmjs.com/package/eznv)
[![Build Status](https://app.wercker.com/status/ec3f4b5f01f28116af446e14554db2e1/s/master)](https://app.wercker.com/project/byKey/ec3f4b5f01f28116af446e14554db2e1)
[![Coverage Status](https://coveralls.io/repos/github/codechaotic/eznv/badge.svg?branch=master)](https://coveralls.io/github/codechaotic/eznv?branch=master)

# **EZNV**<br /><small>Easy Env Management</small>

## Getting started

### Install the package

```sh
npm i --save eznv
```

### Import it into your code

```ts
import { load } from eznv
```

### Define a Schema

Eznv uses a special object to validate a loaded env file. By default when calling `load` Eznv will search for a compatible file named *schema* with an extension of *js*, *json*, *yaml* or *yml*. If found it will import it using the appropriate importer based on the extension. **When using a yaml format you must install `yaml` package alongside `eznv`**.

Here are some examples of schema files in different formats

**YAML**
```yaml
SOME_STRING:
  type: string
  default: test

SOME_INT:
  type: integer
  required: false
```

**JSON**
```json
{
  "SOME_STRING": {
    "type": "string",
    "default": "test"
  },
  "SOME_INT": {
    "type": "integer",
    "required": false
  }
}
```

**JavaScript**
```js
module.exports = {
  SOME_STRING: {
    type: 'string',
    default: 'test'
  },
  SOME_INT: {
    type: 'integer',
    required: false
  }
}
```

**TypeScript**
```ts
export {
  SOME_STRING: {
    type: 'string',
    default: 'test'
  },
  SOME_INT: {
    type: 'integer',
    required: false
  }
}
```

## Create an Interface

This schema is used to validate the provided dotenv file, but doesn't define any typing for the resulting object. To add a type to the object returned from `load` you'll need to create a TypeScript interface mirroring the properties on your schema, and give that to the `load` method as a generic type parameter.

This step is optional, but recommended. If a type is not given the return type will be `any`.

```ts
import { Env } from 'eznv'

export interface EnvTypes extends Env {
  SOME_STRING: string
  SOME_INT: number
}
```

## Load your Env File

Loading the env is done with the `load` method.

```ts
import { load } from 'eznv'

load<EnvTypes>().then(env => {
  console.log(env.SOME_STRING) // OK!
})
```

To load your schema from a typescript file, import your schema and pass it directly to load. This will give you the added benefit of compile-time validation on your schema object (otherwise this only happens at runtime).

```ts
import { load } from 'eznv'
import schema from './schema'

load<EnvTypes>(schema).then(env => {
  console.log(env.SOME_STRING) // OK!
})
```

The method accepts many options to configure how loading is handled. See [Options](#Options) for details.

## Schema Properties

A schema is a dictionary of property validators. Each key must be a [valid variable name](#Variables) and each property must be a valid definition for a `number`, `integer`, `string`, or `boolean` validator.

### Common Validator Properties

|Property|Description|
|---|---|
|`type`|Every validator has a `type` property to specify what kind of property it is validating. This will have the value of "string" for `string` properties, "number" for `number` properties, "integer" for `integer` properties, and `boolean` for boolean properties.|
|`default`|Optionally, a validator can set a default value to use if it is missing from the env file. The type of this value must match the type of the validator.|
|`required`|All properties are considered required unless a boolean validator property `required` is set to false. Required properties will trigger an error when missing as long as `errorOnMissing` is true in the load options. (default)|

### Number Validator Properties

When `type` = "number" the validator will trigger the cooresponding env variable to be parsed as a number and allows the following extra properties.

|Property|Description|
|---|---|
|`minimum`|The value must be greater than or equal to this number.|
|`exclusiveMinimum`|The value must be strictly greater than this number.|
|`maximum`|The value must be less than or equal to this number.|
|`exclusiveMaximum`|The value must be strictly less than this number.|

### Integer Validator Properties

When `type` = "integer" the validator will trigger the cooresponding env variable to be parsed as an integer. It allows the following extra properties.

|Property|Description|
|---|---|
|`minimum`|The value must be greater than or equal to this number.|
|`maximum`|The value must be less than or equal to this number.|

### String Validator Properties

When `type` = "string" the validator will trigger the cooresponding env variable to be parsed as a string. It allows the following extra properties.

|Property|Description|
|---|---|
|`minLength`|The value must have length greater than or equal to this number.|
|`maxLength`|The value must have length less than or equal to this number.|
|`pattern`|The value must match this pattern. (Interpreted with `new RegExp(pattern)`)|

### Boolean Validator Properties

When `type` = "boolean" the validator will trigger the cooresponding env variable to be parsed as a boolean. It must have a value of either "true" or "false", ignoring case.

## Env Files

The supported format for env files is fairly standard. Here's a quick overview.

### Variables

Variable names must start with a capital letter and contain only capital letters, numbers, and underscores.

### Assignments

Setting a value to a variable in the env file is done in bash style, with the variable name on the left, an equal sign, and the value on the right.

```sh
SOME_STRING=this is a value
```

### Values

The right side of an assignment can take two different forms; a literal string or a quoted string.

#### Quoted Values

Quoted values begin and end with either a single or double quote. By defining a value within quotes it will be allowed to include the escaped character sequences for newline ( \n ), tab ( \t ), character-return ( \r ), form-feed ( \f ), and unicode character ( \u0000 ) (where 0000 is a hex sequence for the desired character). This also means that the escape character ( \ ) and either double ( " ) or single quote ( ' ) character must be escaped in quoted values. Finally, the dollar sign ( $ ) can be escaped to prevent it being used for variable substitution.

#### Literal Values

These are interpreted without any escape sequences or variable substitution. They are also trimmed of any whitespace preceeding or following the value.

### Variable Substitution

Quoted values can include other variables either from within the env file or from the system environment. To do this, the dollar sign character ( $ ) is used to indicate a substitution when followed by a valid variable name.

```sh
OTHER_STRING="SOME VALUE"
SOME_STRING="$OTHER_STRING"

# Gives SOME_STRING === "SOME VALUE"
```

When the position of the substitution is immeditately followed by other valid variable name characters, you will need to wrap the variable name in curly braces to distinguish it.

```sh
OTHER_STRING="SOME "
SOME_STRING="${OTHER_STRING}VALUE"

# Gives SOME_STRING === "SOME VALUE"
```

### Comments

Anything to the right of a hash sign ( # ) are interpreted as comments and ignored by the parser, as long as the hash is not within quotes.

```sh
SOME_STRING="# this is not ignored" # this is ignored

# this is also ignored
```

## Modifying `process.env`

While not generally good practice, `eznv` supports overriding the value of `process.env` by setting the *override* option.

```ts
import { load, Env } from 'eznv'

export interface EnvTypes extends Env {
  VAR: number
}

load<EnvTypes>({ override: true }).then(env => {
  process.env.VAR // OK
})
```

If you want the env type to be available when accessing process.env, you can override the declared type. This is provided by [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/fd7bea617cc47ffd252bf90a477fcf6a6b6c3ba5/types/node/index.d.ts#L438) as `ProcessEnv`.

```ts
export interface EnvTypes extends Env {
  VAR: number
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvTypes {}
  }
}

load<EnvTypes>({ override: true }).then(env => {
  process.env.VAR // number
})
```

## Options

The following are options passable to `eznv.load`.

|option|type|description|
|------|----|-----------|
|`cwd`|`string`|Path to the default directory to search for your schema file and env file.<br /><br />*DEFAULTS TO `process.cwd()`*|
|`envFile`|`string`|Path, relative to cwd or absolute, to the env file.<br /><br />*DEFAULTS TO ".env"*|
|`envType`|`string`|Type of env file. For now this can only be 'env' but may allow additional formats in the future.<br /><br />*DEFAULTS TO "env"*|
|`schemaFile`|`string`|Path, relateive to cwd or absolute, to the schema file.<br /><br />*DEFAULTS TO "schema.{js,json,yaml,yml}"|
|`schemaType`|`string`|Type of schema file. This can be "js", "json", or "yaml".<br /><br />*DEFAULTS TO the file type implied by the file extension*|
|`errorOnMissing`|`boolean`|If true, load will error if required properties in the schema are missing.<br /><br />*DEFAULTS TO `true`*|
|`errorOnExtra`|`boolean`|If true, load will error if properties are defined in the env file which have no validator in the schema.<br /><br />*DEFAULTS TO `true`*|
|`override`|`boolean`|If true, load will inject the resulting env object into process.env, overriding any existing values.<br /><br />*DEFAULTS TO `false`|