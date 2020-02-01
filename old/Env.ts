import { Schema } from './Schema'

export type Env <T extends Schema> = {
  [K in keyof T]:
    T[K] extends Schema.NumberProperty ? number
  : T[K] extends Schema.IntegerProperty ? number
  : T[K] extends Schema.StringProperty ? string
  : T[K] extends Schema.BooleanProperty ? boolean
  : never
}
