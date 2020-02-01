export { loadEnv } from './loadEnv'
export { Options } from './Options'
export { Schema } from './Schema'
export { Env } from './Env'

export type Resolve<T> = T extends Promise<infer R> ? R : T
export function Literal <T> (x: T): T { return x }
