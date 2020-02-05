import { EZParserError, EZSchemaError } from './EZError'

export interface EZNumberOptions <
  Required extends boolean | never,
  Default extends number | null | never
> {
  default?: Default
  exclusiveMaximum?: number
  exclusiveMinimum?: number
  maximum?: number
  minimum?: number
  required?: Required
}

export class EZNumber <
  IsRequired extends boolean,
  HasDefault extends boolean
> {
  readonly default: HasDefault extends true ? number : null
  readonly exclusiveMaximum: number | null
  readonly exclusiveMinimum: number | null
  readonly maximum: number | null
  readonly minimum: number | null
  readonly required: IsRequired
  readonly type: 'number'

  constructor (options?: EZNumberOptions<any, any>) {
    for (const key in options) {
      switch (key) {
        case 'default':
        case 'maximum':
        case 'minimum':
        case 'exclusiveMaximum':
        case 'exclusiveMinimum': {
          const value = options[key]
          if (typeof value !== 'number' || !Number.isFinite(value)) {
            if (value !== null) {
              throw new EZSchemaError(`"${key}" must be a number or null`)
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

        default: {
          throw new EZSchemaError(`unknown attribute "${key}"`)
        }
      }
    }

    this.default = options?.default ?? null
    this.exclusiveMaximum = options?.exclusiveMaximum ?? null
    this.exclusiveMinimum = options?.exclusiveMinimum ?? null
    this.maximum = options?.maximum ?? null
    this.minimum = options?.minimum ?? null
    this.required = options?.required ?? true
    this.type = 'number'

    if (this.minimum !== null) {
      if (this.exclusiveMinimum !== null) {
        throw new EZSchemaError('"minimum" and "exclusiveMinimum" cannot both be used')
      }
    }

    if (this.maximum !== null) {
      if (this.exclusiveMaximum !== null) {
        throw new EZSchemaError('"maximum" and "exclusiveMaximum" cannot both be used')
      }
    }

    if (this.minimum !== null) {
      if (this.maximum !== null) {
        if (this.maximum < this.minimum) {
          throw new EZSchemaError('"minimum" must be less than or equal to "maximum"')
        }
      }

      if (this.exclusiveMaximum !== null) {
        if (this.exclusiveMaximum <= this.minimum) {
          throw new EZSchemaError('"minimum" must be less than "exclusiveMaximum"')
        }
      }
    }

    if (this.exclusiveMinimum !== null) {
      if (this.maximum !== null) {
        if (this.maximum <= this.exclusiveMinimum) {
          throw new EZSchemaError('"exclusiveMinimum" must be less than "maximum"')
        }
      }

      if (this.exclusiveMaximum !== null) {
        if (this.exclusiveMaximum <= this.exclusiveMinimum) {
          throw new EZSchemaError('"exclusiveMinimum" must be less than "exclusiveMaximum"')
        }
      }
    }
  }

  parse (raw: string) {
    const value = raw ? Number(raw) : NaN

    if (!Number.isFinite(value)) {
      throw new EZParserError(`must be a number`)
    }

    if (raw && this.minimum !== null) {
      if (value < this.minimum) {
        throw new EZParserError(`must be greater than or equal to ${this.minimum}`)
      }
    }

    if (raw && this.exclusiveMinimum !== null) {
      if (value <= this.exclusiveMinimum) {
        throw new EZParserError(`must be greater than ${this.exclusiveMinimum}`)
      }
    }

    if (raw && this.maximum !== null) {
      if (value > this.maximum) {
        throw new EZParserError(`must be less than or equal to ${this.minimum}`)
      }
    }

    if (raw && this.exclusiveMaximum !== null) {
      if (value >= this.exclusiveMaximum) {
        throw new EZParserError(`must be less than ${this.exclusiveMaximum}`)
      }
    }

    return value
  }
}
