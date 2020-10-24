import * as fs from 'fs'
import * as path from 'path'
import * as grammar from './grammar'

import { EZLoaderError } from './EZError'
import { EZString } from './EZString'
import { EZInteger } from './EZInteger'
import { EZNumber } from './EZNumber'
import { EZBoolean } from './EZBoolean'

const Mode = {
  FileFirst: 'file_first',
  FileOnly: 'file_only',
  NoFile: 'no_file'
} as const

const Sensitivity = {
  Variant: 'variant',
  Base: 'base'
} as const

export interface EZLoadOptions {
  cwd?: string
  file?: string | null
  mode?: 'file_first' | 'file_only' | 'no_file'
  matchCase?: boolean
}

export interface EZParsedLoadOptions {
  mode: 'file_first' | 'file_only' | 'no_file'
  sensitivity: 'variant' | 'base'
  filepath: string
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

  private parseLoadOptions (options: EZLoadOptions): EZParsedLoadOptions {
    return {
      mode: options?.mode ?? Mode.FileFirst,
      sensitivity: options?.matchCase ? Sensitivity.Variant : Sensitivity.Base,
      filepath: path.resolve(options?.cwd ?? process.cwd(), options?.file ?? '.env')
    }
  }

  private resolveEnv (file: any, opts: EZParsedLoadOptions): EZLoadType<P> {
    const res: any = {}

    for (const name in this.properties) {
      const property = this.properties[name]
      let value: string | undefined

      if (opts.mode !== Mode.FileOnly) {
        for (const key in process.env) {
          if (name.localeCompare(key, undefined, { sensitivity: opts.sensitivity })) continue
          value = process.env[key]
        }
      }

      if (file) {
        for (const key in file) {
          if (name.localeCompare(key, undefined, { sensitivity: opts.sensitivity })) continue
          value = file[key]
        }
      }

      if (value === undefined) {
        if (property.default !== null) {
          res[name] = property.default
        } else if (property.required === true) {
          throw new EZLoaderError(`property "${name}" is required`)
        } else res[name] = null
      } else res[name] = property.parse(value)
    }

    return res
  }

  private parseFile (content: string, opts: EZParsedLoadOptions): any {
    const res = {}

    let document: any

    try {
      document = grammar.parse(content)
    } catch (error) {
      throw new EZLoaderError(`failed to parse envFile: ${error.message}`)
    }

    for (const assignment of document.body) {
      const name = assignment.lhs
      const values = [] as any[]

      for (const segment of assignment.rhs) {
        const { type, value } = segment
        if (type === 'Literal') {
          values.push(value)
        } else if (res[value] !== undefined) {
          values.push(res[value])
        } else if (opts.mode !== Mode.FileOnly) {
          let match: string | undefined
          for (const key in process.env) {
            if (value.localeCompare(key, undefined, { sensitivity: opts.sensitivity })) continue
            match = key
          }
          if (match) values.push(process.env[match])
          else throw new EZLoaderError(`failed to substitute variable "${name}": no set variable "${value}"`)
        } else throw new EZLoaderError(`failed to substitute variable "${name}": no set variable "${value}"`)
      }

      res[name] = values.join('')
    }

    const extra: string[] = []

    for (const key in res) {
      let match: string | undefined
      for (const name in this.properties) {
        if (name.localeCompare(key, undefined, { sensitivity: opts.sensitivity })) continue
        match = name
      }
      if (match === undefined) extra.push(key)
      else if (key !== match) {
        res[match] = res[key]
        delete res[key]
      }
    }

    if (extra.length > 0) {
      throw new EZLoaderError(`Unrecognized properties ${extra}`)
    }

    return res
  }

  loadSync (options: EZLoadOptions = {}): EZLoadType<P> {
    const opts = this.parseLoadOptions(options)

    if (opts.mode !== Mode.NoFile) {
      let content!: string

      try {
        content = fs.readFileSync(opts.filepath, 'utf8')
      } catch (error) {
        if (opts.mode === Mode.FileOnly) {
          throw new EZLoaderError(`failed to load envFile: ${error.message}`)
        }
      }

      if (content) {
        const envfile = this.parseFile(content, opts)
        return this.resolveEnv(envfile, opts)
      } else {
        return this.resolveEnv(null, opts)
      }
    } else {
      return this.resolveEnv(null, opts)
    }
  }

  async load (options: EZLoadOptions): Promise<EZLoadType<P>> {
    const opts = this.parseLoadOptions(options)

    if (opts.mode !== Mode.NoFile) {
      let content!: string
      try {
        content = await new Promise((resolve, reject) => {
          fs.readFile(opts.filepath, 'utf8', (err, res) => {
            err ? reject(err) : resolve(res)
          })
        })
      } catch (error) {
        if (opts.mode === Mode.FileOnly) {
          throw new EZLoaderError(`failed to load envFile: ${error.message}`)
        }
      }

      if (content) {
        const envfile = this.parseFile(content, opts)
        return this.resolveEnv(envfile, opts)
      } else {
        return this.resolveEnv(null, opts)
      }
    } else {
      return this.resolveEnv(null, opts)
    }
  }
}
