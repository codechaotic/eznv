[![NPM](https://img.shields.io/npm/v/eznv.svg)](https://www.npmjs.com/package/eznv)
[![Build Status](https://app.wercker.com/status/ec3f4b5f01f28116af446e14554db2e1/s/master)](https://app.wercker.com/project/byKey/ec3f4b5f01f28116af446e14554db2e1)
[![Coverage Status](https://coveralls.io/repos/github/codechaotic/eznv/badge.svg?branch=master)](https://coveralls.io/github/codechaotic/eznv?branch=master)

# **EZNV**<br /><small>Easy Env Management</small>

## Getting started

### Install the package

```sh
npm i --save eznv
```

### Define a Schema

EZNV uses a schema object to validate an env file and to determine the type of the resulting Env object.

```ts
  import { loadEnv } from 'eznv'

  loadEnv({
    VAR: { type: 'integer' }
  }).then(env => {
    env.VAR // number
  })
```

Note that defining the schema in-line with the function call as shown above is important for TypeScript to correctly infer the result type. Defining the schema elsewhere will cause a typing error.

```ts
const s = {
  VAR: { type: 'integer' }
}

// ERROR Type Mismatch
// { type: string } cannot be converted to { type: 'integer' }
EZNV.loadEnv(schema).then(env => {})
```

To get around this EZNV provides a helper function `Literal` which can be used when in-line definition isn't preferred.

```ts
import { Literal, loadEnv } from 'eznv'

const s = Literal({
  VAR: { type: 'integer' }
})

// OK!
EZNV.loadEnv(schema).then(env => {})
```

Additionally, you can use the included type `Env` to access the result type directly based on a schema. This will be useful if you want to override `process.env`.

```ts
  import { Env } from 'eznv'

  const env : Env<{
    VAR: { type: 'integer' }
  }

  // OK
  env.VAR
```

## Schema Properties

A schema is a dictionary of property validators. Each key must be a [valid variable name](#Variables) and each property must be a valid definition for a `number`, `integer`, `string`, or `boolean` validator.

### Common Validator Properties

|Property|Description|
|---|---|
|`type`|Every validator has a `type` property to specify what kind of property it is validating. This will have the value of "string" for `string` properties, "number" for `number` properties, "integer" for `integer` properties, and `boolean` for boolean properties.|
|`default`|Optionally, a validator can set a default value to use if it is missing from the env file. The type of this value must match the type of the validator.|
|`required`|All properties are considered required unless a boolean validator property `required` is set to false. Required properties will trigger an error when missing as long as `errorOnMissing` is true in the options. (default)|

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
import { Literal, loadEnv } from 'eznv'

const schema = Literal({
  VAR: { type: 'integer' }
})

loadEnv(schema, { override: true }).then(env => {
  process.env.VAR // OK, but type is wrong
})
```

If you want the coorect types to be provided when accessing process.env, you can override the declared type. This is provided by [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/fd7bea617cc47ffd252bf90a477fcf6a6b6c3ba5/types/node/index.d.ts#L438) as `ProcessEnv`.

```ts
import { Liteal, Env, loadEnv } from 'eznv'

const schema = Literal({
  VAR: { type: 'integer' }
})

type CustomEnv = Env<typeof schema>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CustomEnv {}
  }
}

loadEnv(schema, { override: true }).then(env => {
  process.env.VAR // number
})
```

## Options

The following are options passable to `eznv.loadEnv`.

|option|type|default|description|
|------|----|-------|-----------|
|`cwd`|`string`|`process.cwd()`|Path to the default directory to search for your schema file and env file|
|`envFile`|`string`|`.env`|Path, relative to cwd or absolute, to the env file|
|`errorOnMissing`|`boolean`|`true`|If true, load will error if required properties in the schema are missing|
|`errorOnExtra`|`boolean`|`true`|If true, load will error if properties are defined in the env file which have no validator in the schema|
|`useProcessEnv`|`boolean`|`false`|If true, variables missing from the env file will use matching keys from the process environment|
|`override`|`boolean`|`false`|If true, load will inject the resulting env object into process.env, overriding any existing values|
