import { EZParserError, EZSchemaError } from './EZError'

export interface EZBooleanOptions <
  Required extends boolean | never,
  Default extends boolean | null | never
> {
  default?: Default
  falseyValues?: string[]
  required?: Required
  strictCase?: boolean
  truthyValues?: string[]
}

export class EZBoolean <
  IsRequired extends boolean,
  HasDefault extends boolean
> {
  readonly default: HasDefault extends true ? boolean : null
  readonly falseyValues: string[]
  readonly required: IsRequired
  readonly strictCase: boolean
  readonly truthyValues: string[]
  readonly type: 'boolean'

  constructor (options?: EZBooleanOptions<any, any>) {
    for (const key in options) {
      switch (key) {
        case 'default': {
          if (typeof options[key] !== 'boolean') {
            if (options[key] !== null) {
              throw new EZSchemaError(`"${key}" must be boolean or null`)
            }
          }
          break
        }

        case 'required':
        case 'strictCase': {
          if (typeof options[key] !== 'boolean') {
            throw new EZSchemaError(`"${key}" must be boolean`)
          }
          break
        }

        case 'falseyValues':
        case 'truthyValues': {
          const value = options[key] as any
          if (!Array.isArray(value) || value.some(x => typeof x !== 'string')) {
            throw new EZSchemaError(`"${key}" must an array of strings`)
          }
          break
        }

        default: {
          throw new EZSchemaError(`unknown attribute "${key}"`)
        }
      }
    }

    this.default = options?.default ?? null
    this.falseyValues = options?.falseyValues ?? ['false']
    this.required = options?.required ?? true
    this.strictCase = options?.strictCase ?? false
    this.truthyValues = options?.truthyValues ?? ['true']
    this.type = 'boolean'

    const truthy = this.truthyValues
    const falsey = this.falseyValues
    const strict = this.strictCase

    for (let i = 0; i < truthy.length; i++) {
      for (let j = i + 1; j < truthy.length; j++) {
        const distance = truthy[i].localeCompare(truthy[j], undefined, { sensitivity: strict ? 'variant' : 'base' })
        if (distance === 0) throw new EZSchemaError(`truthyValues must be unique (${truthy[i]}=${truthy[j]})`)
      }
    }

    for (let i = 0; i < falsey.length; i++) {
      for (let j = i + 1; j < falsey.length; j++) {
        const distance = falsey[i].localeCompare(falsey[j], undefined, { sensitivity: strict ? 'variant' : 'base' })
        if (distance === 0) throw new EZSchemaError(`falseyValues must be unique (${falsey[i]}=${falsey[j]})`)
      }
    }

    for (const yes of truthy) {
      for (const no of falsey) {
        const distance = yes.localeCompare(no, undefined, { sensitivity: strict ? 'variant' : 'base' })
        if (distance === 0) {
          throw new EZSchemaError(`truthyValues and falseyValues must be distinct (${yes}=${no})`)
        }
      }
    }
  }

  parse (raw: string) {
    const truthy = this.truthyValues
    const falsey = this.falseyValues
    const strict = this.strictCase
    const sensitivity = strict ? 'variant' : 'base'

    let truthyMatch = false
    let falseyMatch = false

    for (const yes of truthy) {
      const distance = yes.localeCompare(raw, undefined, { sensitivity })
      if (distance === 0) truthyMatch = true
    }

    for (const no of falsey) {
      const distance = no.localeCompare(raw, undefined, { sensitivity })
      if (distance === 0) falseyMatch = true
    }

    let value!: boolean

    if (truthyMatch && !falseyMatch) {
      value = true
    } else if (!truthyMatch && falseyMatch) {
      value = false
    } else {
      throw new EZParserError(`must match a valid truthy (${truthy}) or falsey (${falsey}) value`)
    }

    return value
  }
}
