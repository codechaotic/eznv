import * as assert from 'assert'
import {
  Guard,
  Options,
  Parse,
  Schema,
  Env
} from '.'

export function applySchema (raw: Parse.Raw, schema: Schema, options: Options): Env<Schema> {
  const env = {}

  for (const key in raw) {
    if (Guard.isUndefined(schema[key]) && options.errorOnExtra) {
      throw new Error(`Unknown env variable ${key}`)
    }
  }

  for (const key in schema) {
    const property = schema[key]
    const value = raw[key]

    if (Guard.isUndefined(value)) {
      if (Guard.isUndefined(property.required) || property.required) {
        if (Guard.isUndefined(property.default) && options.errorOnMissing) {
          throw new Error(`Missing env variable ${key}`)
        } else {
          env[key] = property.default
        }
      } else env[key] = null
    } else {
      switch (property.type) {
        case 'number':
          const num = Number(value)
          assert(Number.isFinite(num), `env variable "${key}" must be a valid number`)

          if (Guard.isDefined(property.minimum)) {
            assert(num >= property.minimum, `env variable "${key}" must be greater than or equal to ${property.minimum}`)
          }

          if (Guard.isDefined(property.exclusiveMinimum)) {
            assert(num > property.exclusiveMinimum, `env variable "${key}" must be greater than ${property.exclusiveMinimum}`)
          }

          if (Guard.isDefined(property.maximum)) {
            assert(num <= property.maximum, `env variable "${key}" must be less than or equal to ${property.minimum}`)
          }

          if (Guard.isDefined(property.exclusiveMaximum)) {
            assert(num < property.exclusiveMaximum, `env variable "${key}" must be greater than ${property.exclusiveMaximum}`)
          }

          env[key] = num
          break
        case 'integer':
          const int = Number(value)
          assert(Number.isFinite(int), `env variable "${key}" must be a valid number`)
          assert(Number.isInteger(int), `env variable "${key}" must be an integer`)

          if (Guard.isDefined(property.minimum)) {
            assert(int >= property.minimum, `env variable "${key}" must be greater than or equal to ${property.minimum}`)
          }

          if (Guard.isDefined(property.maximum)) {
            assert(int <= property.maximum, `env variable "${key}" must be less than or equal to ${property.minimum}`)
          }

          env[key] = int
          break
        case 'string':
          const str = value

          if (Guard.isDefined(property.minLength)) {
            assert(str.length >= property.minLength, `env variable "${key}" must have length greater than or equal to ${property.minLength}`)
          }

          if (Guard.isDefined(property.maxLength)) {
            assert(str.length >= property.maxLength, `env variable "${key}" must have length less than or equal to ${property.maxLength}`)
          }

          if (Guard.isDefined(property.pattern)) {
            const regexp = new RegExp(property.pattern)
            assert(regexp.test(str), `env variable "${key}" must match pattern ${regexp}`)
          }

          env[key] = str
          break
        case 'boolean':
          assert(/true|false/i.test(value), `env variable "${key}" must be either true or false`)
          env[key] = /true/i.test(value)
          break
        default: throw new Error('Unknown schema property type')
      }
    }
  }

  return env
}
