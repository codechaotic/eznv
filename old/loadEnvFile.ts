import * as fs from 'fs'
import { Format } from './Format'
import { parse } from './parse'
import { promisify } from 'util'

const access = promisify(fs.access)
const readFile = promisify(fs.readFile)

export async function loadEnvFile (envFile: string): Promise<Format.Raw> {
  try {
    await access(envFile, fs.constants.R_OK)
  } catch (error) {
    return null
  }

  const buffer = await readFile(envFile)

  const document = parse(buffer.toString()) as Format.Document

  const raw = {}

  for (const assignment of document.body) {
    const name = assignment.lhs
    const values = []

    for (const segment of assignment.rhs) {
      const { type, value } = segment
      if (type === 'Literal') {
        values.push(value)
      } else if (raw[value]) {
        values.push(raw[value])
      } else if (process.env[value]) {
        values.push(process.env[value])
      } else throw new Error(`No set variable "${value}" when setting "${name}"`)
    }

    raw[name] = values.join('')
  }

  return raw
}
