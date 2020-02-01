import * as fs from 'fs'
import * as path from 'path'
import * as grammar from './grammar'
import { promisify } from 'util'

import * as String from './String'
import * as Integer from './Integer'
import * as Number from './Number'
import * as Boolean from './Boolean'

const Mode = {
  Default: 'default',
  FileOnly: 'file_only',
  NoFile: 'no_file'
}

export class EZNVError extends Error {
  public get name () { return 'EZNVError' }
}

export interface LoadOptions {
  cwd?: string
  file?: string | null
  mode?: 'default' | 'file_only' | 'no_file'
  matchCase?: boolean
  ignoreExtra?: boolean
}

export type PropertyDefinition
  = Number.NumberDefinition
  | Integer.IntegerDefinition
  | String.StringDefinition
  | Boolean.BooleanDefinition

export type PropertyParser
  = Number.NumberParser
  | Integer.IntegerParser
  | String.StringParser
  | Boolean.BooleanParser

export type PropertyResult
  = Number.NumberResult
  | Integer.IntegerResult
  | String.StringResult
  | Boolean.BooleanResult


export interface SchemaProperties {
  [x: string]: PropertyDefinition
}

export interface SchemaParserMap {
  [x: string]: PropertyParser
}

export type PropertyType <P extends PropertyDefinition> =
    P extends { default: number } | { required: true } ?
      P extends { type: 'integer' } ? number
    : P extends { type: 'number' } ? number
    : P extends { type: 'string' } ? string
    : P extends { type: 'boolean' } ? boolean
    : never
  : P extends { type: 'integer' } ? number | null
  : P extends { type: 'number' } ? number | null
  : P extends { type: 'string' } ? string | null
  : P extends { type: 'boolean' } ? boolean | null
  : never

export type SchemaType <S extends SchemaProperties> = {
  [P in keyof S]: PropertyType<S[P]>
}

export class Schema <S extends SchemaProperties> {
  static Boolean = Boolean.BooleanProperty
  static String = String.StringProperty
  static Number = Number.NumberProperty
  static Integer = Integer.IntegerProperty

  private parsers = {} as SchemaParserMap
  private definitions = {} as S
  private properties = [] as string[]

  constructor (schema: S) {
    const errors = exports.validateProperties(schema)
    if (errors.length > 0) {
      const message = exports.combineErrors('Cannot parse schema', errors)
      throw new EZNVError(message)
    } else {
      this.parsers = exports.createProperties(schema)
      for (const key in schema) {
        this.properties.push(key)
        this.definitions[key] = Object.assign({}, schema[key])
      }
      this.properties.sort()
    }
  }

  async load (options: LoadOptions = {}): Promise<SchemaType<S>> {
    const mode = options.mode || Mode.Default

    const matchCase = options.matchCase || false
    const sensitivity = matchCase ? 'variant' : 'base'
    const useProcessEnv = [Mode.Default, Mode.NoFile].includes(mode)

    const file = await exports.loadEnvFile(options, this.definitions)
    const env = {} as any
    const errors = [] as string[][]

    for (const property of this.properties) {
      const definition = this.definitions[property]
      let value: string | undefined

      if (useProcessEnv) {
        const match = exports.findWithSensitivity(property, process.env, sensitivity)
        if (match && typeof process.env[match] === 'string') value = process.env[match]
      }

      const match = exports.findWithSensitivity(property, file, sensitivity)
      if (match && typeof file[match] === 'string') value = file[match]

      if (value === undefined) {
        if (definition.default !== undefined) {
          env[property] = definition.default
        } else if (definition.required === undefined || definition.required === true) {
          errors.push([property, definition.type, 'is required'])
        } else env[property] = null
      } else {
        const parse = this.parsers[property]
        const result = parse(value)

        if (result.errors.length > 0) {
          errors.push([property, definition.type, ...result.errors])
        } else env[property] = result.value
      }
    }

    if (errors.length > 0) {
      const message = exports.combineErrors('Could not load env', errors)
      throw new EZNVError(message)
    } else return env
  }
}

export async function loadEnvFile (options: LoadOptions, schema: SchemaProperties) {
  const mode = options.mode || Mode.Default
  const load = [Mode.Default, Mode.FileOnly].includes(mode)

  if (!load) return {}

  const useProcessEnv = [Mode.Default].includes(mode)
  const ignoreExtra = options.ignoreExtra || false
  const matchCase = options.matchCase || false
  const file = options.file || '.env'

  const sensitivity = matchCase ? 'variant' : 'base'
  const filepath = path.resolve(process.cwd(), file)

  const result = {} as any

  let buffer!: Buffer
  try { buffer = await promisify(fs.readFile)(filepath) }
  catch (error) {
    throw new EZNVError(`failed to load envFile: ${error.message}`)
  }

  let document: any
  try { document = grammar.parse(buffer.toString()) }
  catch (error) {
    throw new EZNVError(`failed to parse envFile: ${error.message}`)
  }

  for (const assignment of document.body) {
    const name = assignment.lhs
    const values = [] as any[]

    for (const segment of assignment.rhs) {
      const { type, value } = segment
      if (type === 'Literal') {
        values.push(value)
      } else if (result[value] !== undefined) {
        values.push(result[value])
      } else if (useProcessEnv && process.env[value] !== undefined) {
        values.push(process.env[value])
      } else throw new EZNVError(`failed to substitute variable "${name}": no set variable "${value}"`)
    }

    result[name] = values.join('')
  }

  if (!ignoreExtra) {
    const extra: string[] = []

    for (const key in result) {
      const match = exports.findWithSensitivity(key, schema, sensitivity)
      if (!match) extra.push(key)
    }

    if (extra.length > 0) {
      throw new EZNVError(`Unrecognized properties ${extra}`)
    }
  }
  return result
}

export function validateProperties (properties: SchemaProperties) {
  const errors = [] as string[][]

  for (const property of Object.keys(properties) ) {
    const definition = properties[property]

    if (!(definition instanceof Object)) {
      errors.push([property, 'unknown', 'must be an object'])
    }

    if (definition === null) {
      errors.push([property, 'unknown', 'cannot be null'])
    }

    if (definition?.type !== undefined) {
      switch (definition.type) {
        case 'number': {
          const messages = Number.validateNumber(definition)
          if (messages.length > 0) errors.push([property, 'number', ...messages])
          break
        }

        case 'integer': {
          const messages = Integer.validateInteger( definition)
          if (messages.length > 0) errors.push([property, 'integer', ...messages])
          break
        }

        case 'string': {
          const messages = String.validateString(definition)
          if (messages.length > 0) errors.push([property, 'string', ...messages])
          break
        }

        case 'boolean': {
          const messages = Boolean.validateBoolean(definition)
          if (messages.length > 0) errors.push([property, 'boolean', ...messages])
          break
        }
      }
    }
  }

  return errors
}

export function createProperties (properties: SchemaProperties) {
  const parsers = {} as SchemaParserMap

  for (const property of Object.keys(properties) ) {
    const definition = properties[property]

    switch (definition.type) {
      case 'number': {
        parsers[property] = Number.parseNumber(definition)
        break
      }

      case 'integer': {
        parsers[property] = Integer.parseInteger(definition)
        break
      }

      case 'string': {
        parsers[property] = String.parseString(definition)
        break
      }

      case 'boolean': {
        parsers[property] = Boolean.parseBoolean(definition)
        break
      }
    }
  }

  return parsers
}

export function findWithSensitivity (value: string, source: object, sensitivity: string) {
  for (const key in source) {
    if (value.localeCompare(key, undefined, { sensitivity })) continue
    return key
  }
}

export function combineErrors(baseError: string, propErrors: string[][]) {
  let lines = [baseError] as string[]

  for (let i = 0; i < propErrors.length; i++) {
    const error = propErrors[i]

    if (error.length === 3) {
      lines.push(`\t${error[1]} property ${error[0]} ${error[2]}`)
    } else {
      lines.push(`\t${error[1]} property ${error[0]}:`)
      for (const message of error.slice(2)) {
        lines.push(`\t${message}`)
      }
    }

    if (i + 1 < propErrors.length) lines.push('')
  }

  return lines.join('\n')
}
