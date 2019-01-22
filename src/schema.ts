import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'
import { promisify, isUndefined } from 'util'

import { SchemaFileType, Raw, Env, Options } from '.'

const readFile = promisify(fs.readFile)
const VARNAME_REGEXP = /^[A-Z][A-Z0-9]*(?:_?[A-Z0-9]+)*$/

export interface Property {
  type: string
  default?: any
  required?: boolean
}

export interface NumberProperty extends Property {
  type: 'number'
  default?: number
  minimum?: number
  exclusiveMinimum?: number
  maximum?: number
  exclusiveMaximum?: number
}

export interface IntegerProperty extends Property {
  type: 'integer'
  default?: number
  minimum?: number
  maximum?: number
}

export interface StringProperty extends Property {
  type: 'string'
  default?: string
  minLength?: number
  maxLength?: number
  pattern?: string
}

export interface BooleanProperty extends Property {
  type: 'boolean'
  default?: boolean
}

export type SchemaProperty
  = NumberProperty
  | IntegerProperty
  | StringProperty
  | BooleanProperty

export interface Schema {
  [x: string]: SchemaProperty
}

export function isBool (x: any): x is boolean {
  return typeof x === 'boolean'
}

export function isString (x: any): x is string {
  return typeof x === 'string'
}

export function isNumber (x: any): x is number {
  return typeof x === 'number'
}

export function isInteger (x: any): boolean {
  return isNumber(x) && Number.isInteger(x)
}

export function isRegExp (x: any): boolean {
  try {
    new RegExp(x).test('')
    return true
  } catch (e) {
    return false
  }
}

export function isDefined (x: any): boolean {
  return !isUndefined(x)
}

export async function loadSchema (file: string, type: SchemaFileType): Promise<Schema> {
  let schema: Schema

  switch (type) {
    case 'json':
    case 'js':
      schema = await import(file)
      break
    case 'yaml':
      const yaml = await import('yaml')
      const buffer = await readFile(file)
      schema = yaml.parse(buffer.toString())
      break
    default:
      throw new Error(`Unrecognized schema type ${type}`)
  }

  assert(schema, 'Invalid Schema')
  assert(schema instanceof Object, 'Invalid Schema')

  return schema
}

export function validateSchema (options: Options, schema: Schema) {
  for (const key in schema) {
    const property = schema[key]

    assert(VARNAME_REGEXP.test(key), `Invalid Schema Property Name ${key}`)
    assert(property, `Invalid Schema Property Value ${key}`)
    assert(property instanceof Object, `Invalid Schema Property Value ${key}`)

    if (isUndefined(property.required)) property.required = true

    switch (property.type) {
      case 'number':
        for (const key in property) {
          switch (key) {
            case 'type': continue
            case 'default':
              assert(isNumber(property[key]), 'number property "default" must be number')
              break
            case 'required':
              assert(isBool(property[key]), 'number property "required" must be boolean')
              break
            case 'maximum':
              assert(isNumber(property[key]), 'number property "maximum" must be number')
              break
            case 'minimum':
              assert(isNumber(property[key]), 'number property "minimum" must be number')
              break
            case 'exclusiveMaximum':
              assert(isNumber(property[key]), 'number property "exclusiveMaximum" must be number')
              break
            case 'exclusiveMinimum':
              assert(isNumber(property[key]), 'number property "exclusiveMinimum" must be number')
              break
            default: throw new Error(`unknown number property key "${key}"`)
          }
        }

        if (isDefined(property.minimum) && isDefined(property.exclusiveMinimum)) {
          throw new Error('number properties "minimum" and "exclusiveMinimum" cannot both be used')
        }

        if (isDefined(property.maximum) && isDefined(property.exclusiveMaximum)) {
          throw new Error('number properties "maximum" and "exclusiveMaximum" cannot both be used')
        }

        if (isDefined(property.minimum)) {
          if (isDefined(property.maximum)) {
            assert(property.minimum < property.maximum, 'number property "minimum" must be less than property "maximum"')
          }

          if (isDefined(property.exclusiveMaximum)) {
            assert(property.minimum < property.exclusiveMaximum, 'number property "minimum" must be less than property "exclusiveMaximum"')
          }
        }

        if (isDefined(property.exclusiveMinimum)) {
          if (isDefined(property.maximum)) {
            assert(property.exclusiveMinimum < property.maximum, 'number property "exclusiveMinimum" must be less than property "maximum"')
          }

          if (isDefined(property.exclusiveMaximum)) {
            assert(property.exclusiveMinimum < property.exclusiveMaximum, 'number property "exclusiveMinimum" must be less than property "exclusiveMaximum"')
          }
        }
        break
      case 'integer':
        for (const key in property) {
          switch (key) {
            case 'type': continue
            case 'default':
              assert(isInteger(property[key]), 'integer property "default" must be integer')
              break
            case 'required':
              assert(isBool(property[key]), 'integer property "required" must be boolean')
              break
            case 'maximum':
              assert(isInteger(property[key]), 'integer property "maximum" must be number')
              break
            case 'minimum':
              assert(isInteger(property[key]), 'integer property "minimum" must be number')
              break
            default: throw new Error(`unknown integer property key "${key}"`)
          }
        }

        if (isDefined(property.minimum) && isDefined(property.maximum)) {
          assert(property.minimum < property.maximum, 'integer property "minimum" must be less than property "maximum"')
        }
        break
      case 'string':
        for (const key in property) {
          switch (key) {
            case 'type': continue
            case 'default':
              assert(isString(property[key]), 'string property "default" must be string')
              break
            case 'required':
              assert(isBool(property[key]), 'string property "required" must be boolean')
              break
            case 'minLength':
              assert(isInteger(property[key]), 'string property "minLength" must be number')
              break
            case 'maxLength':
              assert(isInteger(property[key]), 'string property "maxLength" must be number')
              break
            case 'pattern':
              assert(isRegExp(property[key]), 'string property "pattern" must be a string')
              break
            default: throw new Error(`unknown string property key "${key}"`)
          }
        }

        if (isDefined(property.minLength) && isDefined(property.maxLength)) {
          assert(property.minLength < property.maxLength, 'string property "minLength" must be less than property "maxLength"')
        }
        break
      case 'boolean':
        for (const key in property) {
          switch (key) {
            case 'type': continue
            case 'default':
              assert(isBool(property[key]), 'boolean property "default" must be boolean')
              break
            case 'required':
              assert(isBool(property[key]), 'boolean property "required" must be boolean')
              break
            default: throw new Error(`unknown boolean property key "${key}"`)
          }
        }
        break
      default: throw new Error(`unknown property type ${(property as Property).type}`)
    }
  }
}

export function applySchema<E extends Env> (options: Options, raw: Raw<E>, schema: Schema): E {
  const result = {} as E

  for (const key in raw) {
    if (isUndefined(schema[key]) && options.errorOnExtra) {
      throw new Error(`Unknown env variable ${key}`)
    }
  }

  for (const key in schema) {
    const property = schema[key]
    const value = raw[key]

    if (isUndefined(value)) {
      if (property.required) {
        if (isUndefined(property.default) && options.errorOnMissing) {
          throw new Error(`Missing env variable ${key}`)
        } else {
          result[key] = property.default
        }
      } else result[key] = null
    } else {
      switch (property.type) {
        case 'number':
          const num = Number(value)
          assert(Number.isFinite(num), `env variable "${key}" must be a valid number`)

          if (isDefined(property.minimum)) {
            assert(num >= property.minimum, `env variable "${key}" must be greater than or equal to ${property.minimum}`)
          }

          if (isDefined(property.exclusiveMinimum)) {
            assert(num > property.exclusiveMinimum, `env variable "${key}" must be greater than ${property.exclusiveMinimum}`)
          }

          if (isDefined(property.maximum)) {
            assert(num <= property.maximum, `env variable "${key}" must be less than or equal to ${property.minimum}`)
          }

          if (isDefined(property.exclusiveMaximum)) {
            assert(num < property.exclusiveMaximum, `env variable "${key}" must be greater than ${property.exclusiveMaximum}`)
          }

          result[key] = num
          break
        case 'integer':
          const int = Number(value)
          assert(Number.isFinite(int), `env variable "${key}" must be a valid number`)
          assert(Number.isInteger(int), `env variable "${key}" must be an integer`)

          if (isDefined(property.minimum)) {
            assert(int >= property.minimum, `env variable "${key}" must be greater than or equal to ${property.minimum}`)
          }

          if (isDefined(property.maximum)) {
            assert(int <= property.maximum, `env variable "${key}" must be less than or equal to ${property.minimum}`)
          }

          result[key] = int
          break
        case 'string':
          const str = value

          if (isDefined(property.minLength)) {
            assert(str.length >= property.minLength, `env variable "${key}" must have length greater than or equal to ${property.minLength}`)
          }

          if (isDefined(property.maxLength)) {
            assert(str.length >= property.maxLength, `env variable "${key}" must have length less than or equal to ${property.maxLength}`)
          }

          if (isDefined(property.pattern)) {
            const regexp = new RegExp(property.pattern)
            assert(regexp.test(str), `env variable "${key}" must match pattern ${regexp}`)
          }

          result[key] = str
          break
        case 'boolean':
          assert(/true|false/i.test(value), `env variable "${key}" must be either true or false`)
          result[key] = /true/i.test(value)
          break
        default:
      }
    }
  }

  return result
}
