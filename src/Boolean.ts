export interface BooleanOptions {
  default?: boolean
  falseyValues?: string[]
  required?: boolean
  strictCase?: boolean
  truthyValues?: string[]
}

export interface BooleanDefinition extends BooleanOptions {
  default?: boolean
  falseyValues?: string[]
  required?: boolean
  strictCase?: boolean
  truthyValues?: string[]
  type: 'boolean'
}

export class BooleanProperty implements BooleanDefinition {
  readonly default?: boolean
  readonly falseyValues?: string[]
  readonly required?: boolean
  readonly strictCase?: boolean
  readonly truthyValues?: string[]
  readonly type: 'boolean'

  constructor (options: BooleanOptions) {
    this.default = options.default
    this.falseyValues = options.falseyValues
    this.required = options.required
    this.strictCase = options.strictCase
    this.truthyValues = options.truthyValues
    this.type = 'boolean'
  }
}

export type BooleanParser = (raw: string) => BooleanResult

export interface BooleanResult {
  errors: string[]
  value: boolean | null | undefined
}

export function parseBoolean (definition: BooleanDefinition): BooleanParser {
  return (raw: string): BooleanResult => {
    const errors = [] as string[]
    const truthy = definition.truthyValues || ['true', 'yes', 'y', '1']
    const falsey = definition.falseyValues || ['false', 'no', 'n', '0']
    const strict = definition.strictCase || false
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

    if (!truthyMatch && !falseyMatch) {
      errors.push(`must match a valid truthy (${truthy}) or falsey (${falsey}) value`)
    }

    if (truthyMatch && falseyMatch) {
      errors.push(`must match a valid truthy (${truthy}) or falsey (${falsey}) value`)
    }

    let value: boolean | undefined

    if (truthyMatch && !falseyMatch) value = true
    if (!truthyMatch && falseyMatch) value = false

    if (errors.length > 0) return { value: undefined, errors }
    return { value, errors }
  }
}

export function validateBoolean (definition: BooleanDefinition): string[] {
  const errors: string[] = []

  for (const key in definition) {
    switch (key) {
      case 'default':
      case 'required':
      case 'strictCase': {
        if (typeof definition[key] !== 'boolean') {
          errors.push(`"${key}" must be boolean`)
        }
        break
      }

      case 'falseyValues':
      case 'truthyValues': {
        const value = definition[key]
        if (!Array.isArray(value) || value.some(x => typeof x !== 'string')) {
          errors.push(`"${key}" must an array of strings`)
        }
        break
      }

      case 'type': {
        if (definition[key] !== 'boolean') {
          errors.push(`"${key}" must equal 'boolean'`)
        }
        break
      }

      default: {
        errors.push(`unknown attribute "${key}"`)
      }
    }
  }

  const truthy = definition.truthyValues || ['true', 'yes', 'y', '1']
  const falsey = definition.falseyValues || ['false', 'no', 'n', '0']
  const strict = definition.strictCase || false
  const sensitivity = strict ? 'variant' : 'base'

  for (let i = 0; i < truthy.length; i++) {
    if (typeof truthy[i] !== 'string') continue
    for (let j = i + 1; j < truthy.length; j++) {
      if (typeof truthy[j] !== 'string') continue
      const distance = truthy[i].localeCompare(truthy[j], undefined, { sensitivity })
      if (distance === 0) errors.push(`truthyValues must be unique (${truthy[i]}=${truthy[j]})`)
    }
  }

  for (let i = 0; i < falsey.length; i++) {
    if (typeof falsey[i] !== 'string') continue
    for (let j = i + 1; j < falsey.length; j++) {
      if (typeof falsey[j] !== 'string') continue
      const distance = falsey[i].localeCompare(falsey[j], undefined, { sensitivity })
      if (distance === 0) errors.push(`falseyValues must be unique (${falsey[i]}=${falsey[j]})`)
    }
  }

  for (const yes of truthy) {
    if (typeof yes !== 'string') continue
    for (const no of falsey) {
      if (typeof no !== 'string') continue
      const distance = yes.localeCompare(no, undefined, { sensitivity })
      if (distance === 0) {
        errors.push(`truthyValues and falseyValues must be distinct (${yes}=${no})`)
      }
    }
  }

  return errors
}
