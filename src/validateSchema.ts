import * as assert from 'assert'
import {
  Guard,
  Schema
} from '.'

const VARNAME_REGEXP = /^[A-Z][A-Z0-9]*(?:_?[A-Z0-9]+)*$/

export function validateSchema (schema: Schema) {
  for (const key in schema) {
    const property = schema[key]

    assert(VARNAME_REGEXP.test(key), `Invalid Schema Property Name ${key}`)
    assert(property, `Invalid Schema Property Value ${key}`)
    assert(property instanceof Object, `Invalid Schema Property Value ${key}`)

    switch (property.type) {
      case 'number':
        for (const key in property) {
          switch (key) {
            case 'type': continue
            case 'default':
              assert(Guard.isNumber(property[key]), 'number property "default" must be number')
              break
            case 'required':
              assert(Guard.isBool(property[key]), 'number property "required" must be boolean')
              break
            case 'maximum':
              assert(Guard.isNumber(property[key]), 'number property "maximum" must be number')
              break
            case 'minimum':
              assert(Guard.isNumber(property[key]), 'number property "minimum" must be number')
              break
            case 'exclusiveMaximum':
              assert(Guard.isNumber(property[key]), 'number property "exclusiveMaximum" must be number')
              break
            case 'exclusiveMinimum':
              assert(Guard.isNumber(property[key]), 'number property "exclusiveMinimum" must be number')
              break
            default: throw new Error(`unknown number property key "${key}"`)
          }
        }

        if (Guard.isDefined(property.minimum) && Guard.isDefined(property.exclusiveMinimum)) {
          throw new Error('number properties "minimum" and "exclusiveMinimum" cannot both be used')
        }

        if (Guard.isDefined(property.maximum) && Guard.isDefined(property.exclusiveMaximum)) {
          throw new Error('number properties "maximum" and "exclusiveMaximum" cannot both be used')
        }

        if (Guard.isDefined(property.minimum)) {
          if (Guard.isDefined(property.maximum)) {
            assert(property.minimum < property.maximum, 'number property "minimum" must be less than property "maximum"')
          }

          if (Guard.isDefined(property.exclusiveMaximum)) {
            assert(property.minimum < property.exclusiveMaximum, 'number property "minimum" must be less than property "exclusiveMaximum"')
          }
        }

        if (Guard.isDefined(property.exclusiveMinimum)) {
          if (Guard.isDefined(property.maximum)) {
            assert(property.exclusiveMinimum < property.maximum, 'number property "exclusiveMinimum" must be less than property "maximum"')
          }

          if (Guard.isDefined(property.exclusiveMaximum)) {
            assert(property.exclusiveMinimum < property.exclusiveMaximum, 'number property "exclusiveMinimum" must be less than property "exclusiveMaximum"')
          }
        }
        break
      case 'integer':
        for (const key in property) {
          switch (key) {
            case 'type': continue
            case 'default':
              assert(Guard.isInteger(property[key]), 'integer property "default" must be integer')
              break
            case 'required':
              assert(Guard.isBool(property[key]), 'integer property "required" must be boolean')
              break
            case 'maximum':
              assert(Guard.isInteger(property[key]), 'integer property "maximum" must be number')
              break
            case 'minimum':
              assert(Guard.isInteger(property[key]), 'integer property "minimum" must be number')
              break
            default: throw new Error(`unknown integer property key "${key}"`)
          }
        }

        if (Guard.isDefined(property.minimum) && Guard.isDefined(property.maximum)) {
          assert(property.minimum < property.maximum, 'integer property "minimum" must be less than property "maximum"')
        }
        break
      case 'string':
        for (const key in property) {
          switch (key) {
            case 'type': continue
            case 'default':
              assert(Guard.isString(property[key]), 'string property "default" must be string')
              break
            case 'required':
              assert(Guard.isBool(property[key]), 'string property "required" must be boolean')
              break
            case 'minLength':
              assert(Guard.isInteger(property[key]), 'string property "minLength" must be number')
              break
            case 'maxLength':
              assert(Guard.isInteger(property[key]), 'string property "maxLength" must be number')
              break
            case 'pattern':
              assert(Guard.isRegExp(property[key]), 'string property "pattern" must be a string')
              break
            default: throw new Error(`unknown string property key "${key}"`)
          }
        }

        if (Guard.isDefined(property.minLength) && Guard.isDefined(property.maxLength)) {
          assert(property.minLength < property.maxLength, 'string property "minLength" must be less than property "maxLength"')
        }
        break
      case 'boolean':
        for (const key in property) {
          switch (key) {
            case 'type': continue
            case 'default':
              assert(Guard.isBool(property[key]), 'boolean property "default" must be boolean')
              break
            case 'required':
              assert(Guard.isBool(property[key]), 'boolean property "required" must be boolean')
              break
            default: throw new Error(`unknown boolean property key "${key}"`)
          }
        }
        break
    }
  }
}
