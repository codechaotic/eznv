import { Options, loadOptions, Env, loadEnv, Schema, loadSchema, validateSchema, applySchema } from '.'
import * as path from 'path'
import * as fs from 'fs'

export async function load <Config extends Env = Env> (schema: Schema, options: Partial<Options>) : Promise<Config>
export async function load <Config extends Env = Env> (options?: Partial<Options>) : Promise<Config>
export async function load <Config extends Env = Env> (...args: any[]) : Promise<Config> {
  let options : Options
  let schema : Schema

  switch (args.length) {
    case 0:
      options = await loadOptions()
      break
    case 1:
      options = await loadOptions(args[0])
      break
    case 2:
      options = await loadOptions(args[1]);
      schema = args[0]
    default: throw new Error(`Expected up to two arguments. Got ${args.length}`)
  }

  if (!schema) {
    schema = await loadSchema(options.schemaFile, options.schemaType)
  }

  validateSchema(options, schema)

  const env = await loadEnv<Config>(path.resolve(options.cwd, options.envFile))

  const result = applySchema(options, env, schema)

  return result
}
