import * as fs from 'fs'
import { Format } from './Format'
import { parse } from './parse'

export async function loadEnvFile (envFile: string): Promise<Format.Raw> {
  let buffer = await new Promise((resolve, reject) => {
    fs.readFile(envFile, (err, buffer) => {
      err ? reject(err) : resolve(buffer)
    })
  })

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
