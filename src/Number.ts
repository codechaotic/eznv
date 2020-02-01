export interface NumberOptions {
  default?: number
  exclusiveMaximum?: number
  exclusiveMinimum?: number
  maximum?: number
  minimum?: number
  required?: boolean
}

export interface NumberDefinition extends NumberOptions {
  default?: number
  exclusiveMaximum?: number
  exclusiveMinimum?: number
  maximum?: number
  minimum?: number
  required?: boolean
  type: 'number'
}

export class NumberProperty implements NumberDefinition {
  readonly default?: number
  readonly exclusiveMaximum?: number
  readonly exclusiveMinimum?: number
  readonly maximum?: number
  readonly minimum?: number
  readonly required?: boolean
  readonly type: 'number'

  constructor (options: NumberOptions) {
    this.default = options.default
    this.exclusiveMaximum = options.exclusiveMaximum
    this.exclusiveMinimum = options.exclusiveMinimum
    this.maximum = options.maximum
    this.minimum = options.minimum
    this.required = options.required
    this.type = 'number'
  }
}

export type NumberParser = (raw: string) => NumberResult

export interface NumberResult {
  errors: string[]
  value: number | null | undefined
}

export function parseNumber (definition: NumberDefinition): NumberParser {
  return (raw: string): NumberResult => {
    const value = raw ? Number(raw) : NaN
    const errors = [] as string[]

    if (!Number.isFinite(value)) {
      errors.push(`must be a number`)
    }

    if (raw && definition.minimum !== undefined) {
      if (value < definition.minimum) {
        errors.push(`must be greater than or equal to ${definition.minimum}`)
      }
    }

    if (raw && definition.exclusiveMinimum !== undefined) {
      if (value <= definition.exclusiveMinimum) {
        errors.push(`must be greater than ${definition.exclusiveMinimum}`)
      }
    }

    if (raw && definition.maximum !== undefined) {
      if (value > definition.maximum) {
        errors.push(`must be less than or equal to ${definition.minimum}`)
      }
    }

    if (raw && definition.exclusiveMaximum !== undefined) {
      if (value >= definition.exclusiveMaximum) {
        errors.push(`must be less than ${definition.exclusiveMaximum}`)
      }
    }

    if (errors.length > 0) return { value: undefined, errors }
    return { value, errors }
  }
}

export function validateNumber (definition: NumberDefinition): string[] {
  const errors: string[] = []

  for (const key in definition) {
    switch (key) {
      case 'default':
      case 'maximum':
      case 'minimum':
      case 'exclusiveMaximum':
      case 'exclusiveMinimum': {
        if (typeof definition[key] !== 'number') {
          errors.push(`"${key}" must be a number`)
        }
        break
      }

      case 'required': {
        if (typeof definition[key] !== 'boolean') {
          errors.push(`"${key}" must be a boolean`)
        }
        break
      }

      case 'type': {
        if (definition[key] !== 'number') {
          errors.push(`"${key}" must equal 'number'`)
        }
        break
      }

      default: {
        errors.push(`unknown attribute "${key}"`)
      }
    }
  }

  if (typeof definition.minimum === 'number') {
    if (typeof definition.exclusiveMinimum === 'number') {
      errors.push('"minimum" and "exclusiveMinimum" cannot both be used')
    }
  }

  if (typeof definition.maximum === 'number') {
    if (typeof definition.exclusiveMaximum === 'number') {
      errors.push('"maximum" and "exclusiveMaximum" cannot both be used')
    }
  }

  if (typeof definition.minimum === 'number') {
    if (typeof definition.maximum === 'number') {
      if (definition.maximum < definition.minimum) {
        errors.push('"minimum" must be less than or equal to "maximum"')
      }
    }

    if (typeof definition.exclusiveMaximum === 'number') {
      if (definition.exclusiveMaximum <= definition.minimum) {
        errors.push('"minimum" must be less than "exclusiveMaximum"')
      }
    }
  }

  if (typeof definition.exclusiveMinimum === 'number') {
    if (typeof definition.maximum === 'number') {
      if (definition.maximum <= definition.exclusiveMinimum) {
        errors.push('"exclusiveMinimum" must be less than "maximum"')
      }
    }

    if (typeof definition.exclusiveMaximum === 'number') {
      if (definition.exclusiveMaximum <= definition.exclusiveMinimum)
      errors.push('"exclusiveMinimum" must be less than "exclusiveMaximum"')
    }
  }

  return errors
}
