import { Schema, SyntaxError, parse } from '.'
import * as fs from 'fs'

export interface Document {
  type: 'Document',
  body: Assignment[]
}

export interface Assignment {
  type: 'Assignment'
  lhs: string
  rhs: Segment[]
}

export type Segment = Variable | Literal

export interface Variable {
  type: 'Variable'
  value: string
}

export interface Literal {
  type: 'Literal'
  value: string
}

export interface Env {
  [x:string]: string | boolean | number
}

export type Raw <E extends Env> = {
  [K in keyof E]: string
}

export async function loadEnv<E extends Env> (source) : Promise<Raw<E>> {
  let buffer = await new Promise((resolve, reject) => {
    fs.readFile(source, (err, buffer) => {
      err ? reject(err) : resolve(buffer)
    })
  })
  let document : Document

  try {
    document = parse(buffer.toString())
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.log(error)
    } else {
      console.log(error)
    }
  }

  const env = {} as Raw<E>

  for (const assignment of document.body) {
    const name = assignment.lhs
    const values = []

    for (const segment of assignment.rhs) {
      const { type, value } = segment
      if (type === 'Literal') {
        values.push(value)
      } else if (env[value]) {
        values.push(env[value])
      } else if (process.env[value]) {
        values.push(process.env[value])
      } else throw new Error(`No set variable "${value}" when setting "${name}"`)
    }

    env[name] = values.join('')
  }

  return env
}
