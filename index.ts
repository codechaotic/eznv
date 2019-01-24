export {
  loadEnv,
  Options,
  Schema,
  Env
} from './src'

import {
  loadEnv as l,
  Options as O,
  Schema as S,
  Env as E
} from './src'

namespace EZNV {
  export const loadEnv = l
  export type Options = O
  export type Schema = S
  export const Schema = S
  export type Env<S extends Schema> = E<S>
}

export default EZNV
