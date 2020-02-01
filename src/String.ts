export interface StringOptions {
  default?: string
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  required?: boolean
}

export interface StringDefinition extends StringOptions {
  default?: string
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  required?: boolean
  type: 'string'
}

export class StringProperty implements StringDefinition {
  readonly default?: string
  readonly maxLength?: number
  readonly minLength?: number
  readonly pattern?: RegExp
  readonly required?: boolean
  readonly type: 'string'

  constructor (options: StringOptions) {
    this.default = options.default
    this.maxLength = options.maxLength
    this.minLength = options.minLength
    this.pattern = options.pattern
    this.required = options.required
    this.type = 'string'
  }
}

export type StringParser = (raw: string) => StringResult

export interface StringResult {
  errors: string[]
  value: string | null | undefined
}

export function parseString (definition: StringDefinition): StringParser {
  return (value: string): StringResult => {
    const errors = [] as string[]

    if (definition.minLength !== undefined) {
      if (value.length < definition.minLength) {
        errors.push(`must have length greater than or equal to ${definition.minLength}`)
      }
    }

    if (definition.maxLength !== undefined) {
      if (value.length > definition.maxLength) {
        errors.push(`must have length less than or equal to ${definition.maxLength}`)
      }
    }

    if (definition.pattern !== undefined) {
      if (!definition.pattern.test(value)) {
        errors.push(`must match ${definition.pattern}`)
      }
    }

    if (errors.length > 0) return { value: undefined, errors }
    return { value, errors }
  }
}

export function validateString (definition: StringDefinition) {
  const errors: string[] = []

  for (const key in definition) {
    switch (key) {
      case 'default': {
        if (typeof definition[key] !== 'string') {
          errors.push(`"${key}" must be a string`)
        }
        break
      }

      case 'minLength':
      case 'maxLength': {
        const value = definition[key]
        if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
          errors.push(`"${key}" must be an integer`)
        }
        break
      }

      case 'required': {
        if (typeof definition[key] !== 'boolean') {
          errors.push(`"${key}" must be a boolean`)
        }
        break
      }

      case 'pattern': {
        if (!(definition[key] instanceof RegExp)) {
          errors.push(`"${key}" must be a RegExp`)
        }
        break
      }

      case 'type': {
        if (definition[key] !== 'string') {
          errors.push(`"${key}" must equal 'string'`)
        }
        break
      }

      default: {
        errors.push(`unknown attribute "${key}"`)
      }
    }
  }

  if (typeof definition.minLength === 'number') {
    if (typeof definition.maxLength === 'number') {
      if (definition.maxLength < definition.minLength) {
        errors.push('"minLength" must be less than or equal to "minLength"')
      }
    }
  }

  return errors
}
