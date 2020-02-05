import { EZParserError, EZSchemaError } from './EZError'

export interface EZStringOptions <
  Required extends boolean | never,
  Default extends string | null | never
> {
  default?: Default
  maxLength?: number | null
  minLength?: number | null
  pattern?: RegExp | null
  required?: Required
}

export class EZString <
  IsRequired extends boolean,
  HasDefault extends boolean
> {
  readonly default: HasDefault extends true ? string : null
  readonly maxLength: number | null
  readonly minLength: number | null
  readonly pattern: RegExp | null
  readonly required: IsRequired
  readonly type: 'string'

  constructor (options?: EZStringOptions<any, any>) {
    for (const key in options) {
      switch (key) {
        case 'default': {
          if (typeof options[key] !== 'string') {
            if (options[key] !== null) {
              throw new EZSchemaError(`"${key}" must be a string or null`)
            }
          }
          break
        }

        case 'minLength':
        case 'maxLength': {
          const value = options[key] as any
          if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
            if (value !== null) {
              throw new EZSchemaError(`"${key}" must be an integer`)
            }
          }
          break
        }

        case 'required': {
          if (typeof options[key] !== 'boolean') {
            throw new EZSchemaError(`"${key}" must be a boolean`)
          }
          break
        }

        case 'pattern': {
          if (!(options[key] instanceof RegExp)) {
            throw new EZSchemaError(`"${key}" must be a RegExp`)
          }
          break
        }

        default: {
          throw new EZSchemaError(`unknown attribute "${key}"`)
        }
      }
    }

    this.default = options?.default ?? null
    this.minLength = options?.minLength ?? null
    this.maxLength = options?.maxLength ?? null
    this.pattern = options?.pattern ?? null
    this.required = options?.required ?? true
    this.type = 'string'

    const minLength = this.minLength
    const maxLength = this.maxLength

    if (typeof minLength === 'number') {
      if (typeof maxLength === 'number') {
        if (maxLength < minLength) {
          throw new EZSchemaError('"minLength" must be less than or equal to "minLength"')
        }
      }
    }
  }

  parse (raw: string) {
    const value = raw

    if (this.minLength !== null) {
      if (value.length < this.minLength) {
        throw new EZParserError(`must have length greater than or equal to ${this.minLength}`)
      }
    }

    if (this.maxLength !== null) {
      if (value.length > this.maxLength) {
        throw new EZParserError(`must have length less than or equal to ${this.maxLength}`)
      }
    }

    if (this.pattern !== null) {
      if (!this.pattern.test(value)) {
        throw new EZParserError(`must match ${this.pattern}`)
      }
    }

    return value
  }
}
