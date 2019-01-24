/* eslint-disable no-unused-vars */

import {
  Options,
  Env,
  Schema,
  loadOptions,
  loadEnvFile,
  validateSchema,
  applySchema
} from '.'

export async function loadEnv <S extends Schema> (schema: S, options?: Partial<Options>): Promise<Env<S>> {
  const opts = await loadOptions(options)
  const raw = await loadEnvFile(opts.envFile)

  validateSchema(schema)

  const env = applySchema(raw, schema, opts) as Env<S>

  if (opts.override) {
    Object.assign(process.env, env)
  }

  return env
}
