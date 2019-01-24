export namespace Parse {
  export interface Raw {
    [x: string]: string
  }

  export interface Document {
    type: 'Document',
    body: Assignment[]
  }

  export interface Assignment {
    type: 'Assignment'
    lhs: string
    rhs: Segment[]
  }

  export type Segment = Variable | Literal

  export interface Variable {
    type: 'Variable'
    value: string
  }

  export interface Literal {
    type: 'Literal'
    value: string
  }
}

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

  // export type EnvType<T extends SchemaProperty>
  //   = T extends NumberProperty ? number
  //   : T extends IntegerProperty ? number
  //   : T extends StringProperty ? string
  //   : T extends BooleanProperty ? boolean
  //   : never

  // export type Env <T extends Schema> = {
  //   [K in keyof T]: EnvType<T[K]>
  // }
}

export interface Schema {
  [x: string]: Schema.SchemaProperty
}

export type Env <T extends Schema> = {
  [K in keyof T]:
    T[K] extends Schema.NumberProperty ? number
  : T[K] extends Schema.IntegerProperty ? number
  : T[K] extends Schema.StringProperty ? string
  : T[K] extends Schema.BooleanProperty ? boolean
  : never
}

export interface Options {
  cwd?: string
  envFile?: string
  errorOnMissing?: boolean
  errorOnExtra?: boolean
  override?: boolean
}

export function Schema <T extends Schema> (schema: T): T {
  return schema
}
