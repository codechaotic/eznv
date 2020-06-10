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

EZNV uses a schema object to validate an env file and to determine the type of the resulting object.

```ts
  import EZ from 'eznv'

  const schema = EZ.Schema({
    NUM: EZ.Number({
      default: 0,
      minimum: 0,
      maximum: 10
    })
  })
```

### Load the ENV

```ts
  const config = await schema.load()

  // or to load synchronously

  const config = schema.loadSync()
```

## Load Options

The following are options passable to `schema.load` and `schema.loadSync`.

|option|type|default|description|
|------|----|-------|-----------|
|`cwd`|`string`|`process.cwd()`|Path to the default directory to search for your schema file and env file|
|`file`|`string`|`.env`|Path, relative to cwd or absolute, to the env file|
|`mode`|`file_first`, `no_file`, `file_only`|`file_first`|configure whether use the file only, process.env only, or both
|`matchCase`|`boolean`|`false`|use exact case matching for variable names. Ignores case by default. |


## Schema Properties

The `EZ.Schema` function takes as an argument a dictionary of property definitions. There are four different property definitions you can create. `EZ.Number`, `EZ.String`, `EZ.Integer`, and `EZ.Boolean`. Each type allows for different options to control validation.

### Common Validator Properties

|Option|Description|
|---|---|
|`default`|A default value to use when the property is missing|
|`required`|Should the property be required. Defaults to `true`|

### Number Validator Properties

`EZ.Number` will define a number property.

|Option|Description|
|---|---|
|`minimum`|The value must be greater than or equal to this number.|
|`exclusiveMinimum`|The value must be strictly greater than this number.|
|`maximum`|The value must be less than or equal to this number.|
|`exclusiveMaximum`|The value must be strictly less than this number.|

### Integer Validator Properties

`EZ.Integer` will define an integer property.

|Option|Description|
|---|---|
|`minimum`|The value must be greater than or equal to this number.|
|`maximum`|The value must be less than or equal to this number.|

### String Validator Properties

`EZ.String` will define a string property.

|Option|Description|
|---|---|
|`minLength`|The value must have length greater than or equal to this number.|
|`maxLength`|The value must have length less than or equal to this number.|
|`pattern`|The value must match this regular expression|

### Boolean Validator Properties

`EZ.Boolean` will define a string property.

|Option|Description|
|---|---|
|`truthyValues`|An array of strings to consider `true`|
|`falseyValues`|An array of strings to consider `false`|
|`strictCase`|Should matching against truthy and falsey values consider case? Defaults to `false`|

## Env Files

The supported format for env files is fairly standard. Here's a quick overview.

### Variables

Variable names must start with a letter and contain only letters, numbers, and underscores.

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
