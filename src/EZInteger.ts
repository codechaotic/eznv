import { EZParserError, EZSchemaError } from './EZError'

export interface EZIntegerOptions <
  Required extends boolean | never,
  Default extends number | null | never
> {
  default?: Default
  maximum?: number
  minimum?: number
  required?: Required
}

export class EZInteger <
  IsRequired extends boolean,
  HasDefault extends boolean
> {
  readonly default: HasDefault extends true ? string : null
  readonly maximum: number | null
  readonly minimum: number | null
  readonly required: IsRequired
  readonly type: 'integer'

  constructor (options?: EZIntegerOptions<any, any>) {
    for (const key in options) {
      switch (key) {
        case 'default':
        case 'maximum':
        case 'minimum': {
          const value = options[key]
          if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
            if (value !== null) {
              throw new EZSchemaError(`"${key}" must be an integer`)
            }
          }
          break
        }

        case 'required': {
          if (typeof options[key] !== 'boolean') {
            throw new EZSchemaError(`"${key}" must be boolean`)
          }
          break
        }

        default: {
          throw new EZSchemaError(`unknown attribute "${key}"`)
        }
      }
    }

    this.default = options?.default ?? null
    this.maximum = options?.maximum ?? null
    this.minimum = options?.minimum ?? null
    this.required = options?.required ?? true
    this.type = 'integer'

    const minimum = this.minimum
    const maximum = this.maximum

    if (typeof minimum === 'number') {
      if (typeof maximum === 'number') {
        if (maximum < minimum) {
          throw new EZSchemaError('"minimum" must be less than or equal to "maximum"')
        }
      }
    }
  }

  parse (raw: string) {
    const value = raw ? Number(raw) : NaN

    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      throw new EZParserError(`must be an integer`)
    }

    if (raw && this.minimum !== null) {
      if (value < this.minimum) {
        throw new EZParserError(`must be greater than or equal to ${this.minimum}`)
      }
    }

    if (raw && this.maximum !== null) {
      if (value > this.maximum) {
        throw new EZParserError(`must be less than or equal to ${this.minimum}`)
      }
    }

    return value
  }
}
