import * as assert from 'assert'
import * as path from 'path'
import * as fs from 'fs'

import {
  isDefined,
  isBool,
  isString
} from '.'

export type SchemaFileType = 'js' | 'json' | 'yaml'
export type EnvFileType = 'env'

export interface Options {
  cwd: string
  envFile: string
  errorOnMissing: boolean
  errorOnExtra: boolean
  override: boolean
}

const R_OK = fs.constants.R_OK
const access = (file, access) => new Promise((resolve, reject) => {
  fs.access(file, access, (err) => {
    if (err) reject(err)
    else resolve()
  })
})

export async function loadOptions (custom: Partial<Options> = {}): Promise<Options> {
  const options = {} as Options

  if (isDefined(custom.cwd)) {
    assert(isString(custom.cwd), `Option cwd must be boolean`)
    options.cwd = path.resolve(process.cwd(), custom.cwd)
  } else {
    options.cwd = process.cwd()
  }

  await access(options.cwd, R_OK)

  if (isDefined(custom.envFile)) {
    assert(isString(custom.envFile), `Option envFile must be boolean`)
    options.envFile = path.resolve(options.cwd, custom.envFile)
    await access(options.envFile, R_OK)
  } else {
    options.envFile = path.resolve(options.cwd, '.env')
    await access(options.envFile, R_OK)
  }

  if (isDefined(custom.errorOnMissing)) {
    assert(isBool(custom.errorOnMissing), `Option errorOnMissing must be boolean`)
    options.errorOnMissing = custom.errorOnMissing
  } else {
    options.errorOnMissing = true
  }

  if (isDefined(custom.errorOnExtra)) {
    assert(isBool(custom.errorOnMissing), `Option errorOnExtra must be boolean`)
    options.errorOnExtra = custom.errorOnExtra
  } else {
    options.errorOnExtra = true
  }

  if (isDefined(custom.override)) {
    assert(isBool(custom.override), `Option override must be boolean`)
    options.override = custom.override
  } else {
    options.override = false
  }

  return options
}
