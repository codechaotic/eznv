/* tslint:disable:no-unused-expression no-empty */

import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './String'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('StringProperty', function () {
  it('returns an StringProperty', function () {
    const value = new Module.StringProperty({})
    expect(value.type).to.equal('string')
    expect(value).to.be.instanceof(Module.StringProperty)
  })
})

describe('validateString', function () {
  const validateString = Module.validateString as any

  it('returns an array', function () {
    const errors = validateString({})
    expect(errors).to.be.an('array')
    expect(errors).to.be.empty
  })

  it('accepts type === "string"', function () {
    const errors = validateString({ type: 'string' })
    expect(errors).to.be.empty
  })

  it('errors when type !== "string"', function () {
    const errors = validateString({ type: 'boolean' })
    expect(errors).not.to.be.empty
  })

  it('errors when any unknown property is set', function () {
    const errors = validateString({ unknown: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a string property "default"', function () {
    const errors = validateString({ default: 'value' })
    expect(errors).to.be.empty
  })

  it('errors when "default" is set as a non-string', function () {
    const errors = validateString({ default: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a boolean property "required"', function () {
    const errors = validateString({ required: true })
    expect(errors).to.be.empty
  })

  it('errors when "required" is set as a non-boolean', function () {
    const errors = validateString({ required: null })
    expect(errors).not.to.be.empty
  })

  it('accepts an integer property "minLength"', function () {
    const errors = validateString({ minLength: 1 })
    expect(errors).to.be.empty
  })

  it('errors when "minLength" is set as a non-integer', function () {
    const errors = validateString({ minLength: null })
    expect(errors).not.to.be.empty
  })

  it('accepts an integer property "maxLength"', function () {
    const errors = validateString({ minLength: 1 })
    expect(errors).to.be.empty
  })

  it('errors when "maxLength" is set as a non-integer', function () {
    const errors = validateString({ maxLength: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a regexp property "pattern"', function () {
    const errors = validateString({ pattern: /x/ })
    expect(errors).to.be.empty
  })

  it('errors when "patten" is set as a non-regexp', function () {
    const errors = validateString({ pattern: null })
    expect(errors).not.to.be.empty
  })

  it('accepts minLength < maxLength', function () {
    const errors = validateString({ minLength: 0, maxLength: 1 })
    expect(errors).to.be.empty
  })

  it('accepts minLength = maxLength', function () {
    const errors = validateString({ minLength: 0, maxLength: 0 })
    expect(errors).to.be.empty
  })

  it('errors when minLength > maxLength', function () {
    const errors = validateString({ minLength: 1, maxLength: 0 })
    expect(errors).not.to.be.empty
  })
})

describe('parseString', function () {
  const parseString = Module.parseString as any

  it('parses a valid string', function () {
    const parse = parseString({}) as any
    const result = parse('x')
    expect(result.value).to.equal('x')
    expect(result.errors).to.be.empty
  })

  it('accepts a value with length > minLength', function () {
    const parse = parseString({
      minLength: 1
    }) as any
    const result = parse('xy')
    expect(result.value).to.equal('xy')
    expect(result.errors).to.be.empty
  })

  it('accepts a value with length = minLength', function () {
    const parse = parseString({
      minLength: 1
    }) as any
    const result = parse('x')
    expect(result.value).to.equal('x')
    expect(result.errors).to.be.empty
  })

  it('rejects a value with length < minLength', function () {
    const parse = parseString({
      minLength: 1
    }) as any
    const result = parse('')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('accepts a value with length < maxLength', function () {
    const parse = parseString({
      maxLength: 1
    }) as any
    const result = parse('')
    expect(result.value).to.equal('')
    expect(result.errors).to.be.empty
  })

  it('accepts a value with length = maxLength', function () {
    const parse = parseString({
      minLength: 1
    }) as any
    const result = parse('x')
    expect(result.value).to.equal('x')
    expect(result.errors).to.be.empty
  })

  it('rejects a value with length > maxLength', function () {
    const parse = parseString({
      maxLength: 1
    }) as any
    const result = parse('xy')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('accepts a value matching pattern', function () {
    const parse = parseString({
      pattern: /x/
    }) as any
    const result = parse('x')
    expect(result.value).to.equal('x')
    expect(result.errors).to.be.empty
  })

  it('rejects a value not matching pattern', function () {
    const parse = parseString({
      pattern: /x/
    }) as any
    const result = parse('y')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })
})
