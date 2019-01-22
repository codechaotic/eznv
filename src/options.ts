import * as assert from 'assert'
import * as path from 'path'
import { promisify } from 'util'
import * as fs from 'fs'

export type SchemaFileType = 'js' | 'json' | 'yaml'
export type EnvFileType = 'env'

export interface Options {
  cwd: string
  schemaFile: string
  schemaType: SchemaFileType
  envFile: string
  envType: EnvFileType
  errorOnMissing: boolean
  errorOnExtra: boolean
}

const R_OK = fs.constants.R_OK
const access = promisify(fs.access)

const schemaTypes: SchemaFileType[] = [
  'js',
  'json',
  'yaml'
]

const envTypes: EnvFileType[] = [
  'env'
]

const schemaCandidates = [
  'schema.json',
  'schema.js',
  'schema.yaml',
  'schema.yml'
]

const envCandidates = [
  '.env'
]

export async function loadOptions (custom: Partial<Options> = {}): Promise<Options> {
  const options = {
    cwd: path.resolve(process.cwd(), custom.cwd || '.')
  } as Options

  await access(options.cwd, R_OK)

  if (custom.schemaFile) {
    options.schemaFile = path.resolve(options.cwd, custom.schemaFile)
    await access(options.schemaFile, R_OK)
  } else {
    for (const candidate of schemaCandidates) {
      try {
        const schemaFile = path.resolve(options.cwd, candidate)
        await access(schemaFile, R_OK)
        options.schemaFile = schemaFile
        break
      } catch (error) {/* do nothing */}
    }
    if (!options.schemaFile) throw new Error('No candidate found for schema file')
  }

  if (custom.envFile) {
    options.envFile = path.resolve(options.cwd, custom.envFile)
    await access(options.envFile, R_OK)
  } else {
    for (const candidate of envCandidates) {
      try {
        const envFile = path.resolve(options.cwd, candidate)
        await access(envFile, R_OK)
        options.envFile = envFile
      } catch (error) {/* do nothing */}
    }
    if (!options.envFile) throw new Error('No candidate found for env file')
  }

  if (custom.schemaType) {
    options.schemaType = custom.schemaType
    assert(schemaTypes.includes(options.schemaType), `Schema Type must be 'js', 'json', or 'yaml'`)
  } else {
    const ext = path.extname(options.schemaFile)
    const type: SchemaFileType = {
      '.js': 'js',
      '.json': 'json',
      '.yml': 'yaml',
      '.yaml': 'yaml'
    }[ext]
    assert(type, `Unknown schema file extension ${ext}. Expected .js .json .yml or .yaml`)
    options.schemaType = type
  }

  if (custom.envType) {
    options.envType = custom.envType
    assert(envTypes.includes(options.envType), `Env Type must be 'env'`)
  } else {
    options.envType = 'env'
  }

  if (custom.errorOnMissing) {
    assert(typeof custom.errorOnMissing === 'boolean', `Option errorOnMissing must be boolean`)
    options.errorOnMissing = custom.errorOnMissing
  } else {
    options.errorOnMissing = true
  }

  if (custom.errorOnExtra) {
    assert(typeof custom.errorOnExtra === 'boolean', `Option errorOnExtra must be boolean`)
    options.errorOnExtra = custom.errorOnExtra
  } else {
    options.errorOnExtra = true
  }

  return options
}
