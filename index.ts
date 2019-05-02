export { loadEnv } from './src/loadEnv'
export { Options } from './src/Options'
export { Schema } from './src/Schema'
export { Env } from './src/Env'

export type Resolve<T> = T extends Promise<infer R> ? R : T
export function Literal <T> (x: T) : T { return x }