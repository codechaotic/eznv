export interface IntegerOptions {
  default?: number
  maximum?: number
  minimum?: number
  required?: boolean
}

export interface IntegerDefinition extends IntegerOptions {
  default?: number
  maximum?: number
  minimum?: number
  required?: boolean
  type: 'integer'
}

export class IntegerProperty implements IntegerDefinition {
  readonly default?: number
  readonly maximum?: number
  readonly minimum?: number
  readonly required?: boolean
  readonly type: 'integer'

  constructor (options: IntegerOptions) {
    this.default = options.default
    this.maximum = options.maximum
    this.minimum = options.minimum
    this.required = options.required
    this.type = 'integer'
  }
}

export type IntegerParser = (raw: string) => IntegerResult

export interface IntegerResult {
  errors: string[]
  value: number | null | undefined
}

export function parseInteger (definition: IntegerDefinition): IntegerParser {
  return (raw: string): IntegerResult => {
    const value = raw ? Number(raw) : NaN
    const errors = [] as string[]

    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      errors.push(`must be an integer`)
    }

    if (raw && definition.minimum !== undefined) {
      if (value < definition.minimum) {
        errors.push(`must be greater than or equal to ${definition.minimum}`)
      }
    }

    if (raw && definition.maximum !== undefined) {
      if (value > definition.maximum) {
        errors.push(`must be less than or equal to ${definition.minimum}`)
      }
    }

    if (errors.length > 0) return { value: undefined, errors }
    return { value, errors }
  }
}

export function validateInteger (definition: IntegerDefinition): string[] {
  const errors: string[] = []

  for (const key in definition) {
    switch (key) {
      case 'default':
      case 'maximum':
      case 'minimum': {
        const value = definition[key]
        if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
          errors.push(`"${key}" must be an integer`)
        }
        break
      }

      case 'required': {
        if (typeof definition[key] !== 'boolean') {
          errors.push(`"${key}" must be boolean`)
        }
        break
      }

      case 'type': {
        if (definition[key] !== 'integer') {
          errors.push(`"${key}" must equal 'integer'`)
        }
        break
      }

      default: {
        errors.push(`unknown attribute "${key}"`)
      }
    }
  }

  if (typeof definition.minimum === 'number') {
    if (typeof definition.maximum === 'number') {
      if (definition.maximum < definition.minimum) {
        errors.push('"minimum" must be less than or equal to "maximum"')
      }
    }
  }

  return errors
}
