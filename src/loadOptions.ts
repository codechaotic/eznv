import * as assert from 'assert'
import * as path from 'path'
import * as fs from 'fs'

import { Guard } from './Guard'
import { Options } from './Options'

export async function loadOptions (options: Options = {}): Promise<Options> {
  const opts: Options = {}

  if (Guard.isDefined(options.cwd)) {
    assert(Guard.isString(options.cwd), `Option cwd must be boolean`)
    opts.cwd = path.resolve(process.cwd(), options.cwd)
  } else {
    opts.cwd = process.cwd()
  }

  await isReadable(opts.cwd)

  if (Guard.isDefined(options.envFile)) {
    assert(Guard.isString(options.envFile), `Option envFile must be boolean`)
    opts.envFile = path.resolve(opts.cwd, options.envFile)
    await isReadable(opts.envFile)
  } else {
    opts.envFile = path.resolve(opts.cwd, '.env')
    await isReadable(opts.envFile)
  }

  if (Guard.isDefined(options.errorOnMissing)) {
    assert(Guard.isBool(options.errorOnMissing), `Option errorOnMissing must be boolean`)
    opts.errorOnMissing = options.errorOnMissing
  } else {
    opts.errorOnMissing = true
  }

  if (Guard.isDefined(options.errorOnExtra)) {
    assert(Guard.isBool(options.errorOnExtra), `Option errorOnExtra must be boolean`)
    opts.errorOnExtra = options.errorOnExtra
  } else {
    opts.errorOnExtra = true
  }

  if (Guard.isDefined(options.override)) {
    assert(Guard.isBool(options.override), `Option override must be boolean`)
    opts.override = options.override
  } else {
    opts.override = false
  }

  return opts
}

function isReadable (file) {
  return new Promise((resolve, reject) => {
    fs.access(file, fs.constants.R_OK, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}
