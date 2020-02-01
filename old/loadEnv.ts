import { Schema } from './Schema'
import { Options } from './Options'
import { Env } from './Env'
import { loadOptions } from './loadOptions'
import { loadEnvFile } from './loadEnvFile'
import { validateSchema } from './validateSchema'
import { applySchema } from './applySchema'

export async function loadEnv <S extends Schema> (schema: S, options: Options = {}): Promise<Env<S>> {
  const opts = await loadOptions(options)
  const raw = await loadEnvFile(opts.envFile)

  validateSchema(schema)

  const env = applySchema(raw, schema, opts) as Env<S>

  if (opts.override) {
    process.env = env as any
  }
  return env
}
