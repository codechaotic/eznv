import * as fs from 'fs'
import * as path from 'path'
import * as grammar from './grammar'
import { promisify } from 'util'

import { EZLoaderError } from './EZError'
import { EZString } from './EZString'
import { EZInteger } from './EZInteger'
import { EZNumber } from './EZNumber'
import { EZBoolean } from './EZBoolean'

const Mode = {
  Default: 'default',
  FileOnly: 'file_only',
  NoFile: 'no_file'
}

export interface EZLoadOptions {
  cwd?: string
  file?: string | null
  mode?: 'default' | 'file_only' | 'no_file'
  matchCase?: boolean
}

export type EZProperty
  = EZNumber<boolean, boolean>
  | EZInteger<boolean, boolean>
  | EZString<boolean, boolean>
  | EZBoolean<boolean, boolean>

export interface EZProperties {
  [x: string]: EZProperty
}

export type EZPropertyType <P extends EZProperty> =
    P extends EZNumber<true, boolean> ? number
  : P extends EZNumber<false, true> ? number
  : P extends EZNumber<false, false> ? number | null
  : P extends EZInteger<true, boolean> ? number
  : P extends EZInteger<false, true> ? number
  : P extends EZInteger<false, false> ? number | null
  : P extends EZBoolean<true, boolean> ? boolean
  : P extends EZBoolean<false, true> ? boolean
  : P extends EZBoolean<false, false> ? boolean | null
  : P extends EZString<true, boolean> ? string
  : P extends EZString<false, true> ? string
  : P extends EZString<false, false> ? string | null
  : never

export type EZLoadType <P extends EZProperties> = {
  [K in keyof P]: EZPropertyType<P[K]>
}

export class EZSchema <P extends EZProperties> {
  constructor (private properties: EZProperties) {}

  async load (options: EZLoadOptions = {}): Promise<EZLoadType<P>> {
    const mode = options.mode || Mode.Default

    const useProcessEnv = [Mode.Default, Mode.NoFile].includes(mode)
    const loadFile = [Mode.Default, Mode.FileOnly].includes(mode)
    const matchCase = options.matchCase || false
    const sensitivity = matchCase ? 'variant' : 'base'
    const file = options.file || '.env'
    const filepath = path.resolve(process.cwd(), file)
    const fileResult = {} as any

    if (loadFile) {
      let buffer!: Buffer
      try {
        buffer = await promisify(fs.readFile)(filepath)
      } catch (error) {
        if (mode === Mode.FileOnly) {
          throw new EZLoaderError(`failed to load envFile: ${error.message}`)
        }
      }

      let document: any
      try {
        if (buffer) document = grammar.parse(buffer.toString())
      } catch (error) {
        throw new EZLoaderError(`failed to parse envFile: ${error.message}`)
      }

      if (document) {
        for (const assignment of document.body) {
          const name = assignment.lhs
          const values = [] as any[]

          for (const segment of assignment.rhs) {
            const { type, value } = segment
            if (type === 'Literal') {
              values.push(value)
            } else if (fileResult[value] !== undefined) {
              values.push(fileResult[value])
            } else if (useProcessEnv && process.env[value] !== undefined) {
              values.push(process.env[value])
            } else throw new EZLoaderError(`failed to substitute variable "${name}": no set variable "${value}"`)
          }

          fileResult[name] = values.join('')
        }
      }

      const extra: string[] = []

      for (const key in fileResult) {
        let match = false
        for (const name in this.properties) {
          if (name.localeCompare(key, undefined, { sensitivity })) continue
          match = true
        }
        if (!match) extra.push(key)
      }

      if (extra.length > 0) {
        throw new EZLoaderError(`Unrecognized properties ${extra}`)
      }
    }

    const env = {} as any

    for (const name in this.properties) {
      const property = this.properties[name]
      let value: string | undefined

      if (useProcessEnv) {
        for (const key in process.env) {
          if (name.localeCompare(key, undefined, { sensitivity })) continue
          value = process.env[key]
        }
      }

      for (const key in fileResult) {
        if (name.localeCompare(key, undefined, { sensitivity })) continue
        value = fileResult[key]
      }

      if (value === undefined) {
        if (property.default !== null) {
          env[name] = property.default
        } else if (property.required === true) {
          throw new EZLoaderError(`property "${name}" is required`)
        } else env[name] = null
      } else env[name] = property.parse(value)
    }

    return env
  }
}
