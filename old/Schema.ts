export namespace Schema {
  export type Type = 'number' | 'integer' | 'string' | 'boolean'

  export interface Property {
    type: Type
    default?: any
    required?: boolean
  }

  export interface NumberProperty extends Property {
    type: 'number'
    default?: number
    minimum?: number
    exclusiveMinimum?: number
    maximum?: number
    exclusiveMaximum?: number
  }

  export interface IntegerProperty extends Property {
    type: 'integer'
    default?: number
    minimum?: number
    maximum?: number
  }

  export interface StringProperty extends Property {
    type: 'string'
    default?: string
    minLength?: number
    maxLength?: number
    pattern?: string
  }

  export interface BooleanProperty extends Property {
    type: 'boolean'
    default?: boolean
  }

  export type SchemaProperty
    = NumberProperty
    | IntegerProperty
    | StringProperty
    | BooleanProperty
}

export interface Schema {
  [x: string]: Schema.SchemaProperty
}
