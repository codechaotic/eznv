/* tslint:disable:no-unused-expression no-empty */

import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './Integer'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('IntegerProperty', function () {
  it('returns an IntegerProperty', function () {
    const value = new Module.IntegerProperty({})
    expect(value.type).to.equal('integer')
    expect(value).to.be.instanceof(Module.IntegerProperty)
  })
})

describe('validateIntege', function () {
  const validateInteger = Module.validateInteger as any

  it('returns an array', function () {
    const errors = validateInteger({})
    expect(errors).to.be.an('array')
    expect(errors).to.be.empty
  })

  it('accepts type === "integer"', function () {
    const errors = validateInteger({ type: 'integer' })
    expect(errors).to.be.empty
  })

  it('errors when type !== "integer"', function () {
    const errors = validateInteger({ type: 'string' })
    expect(errors).not.to.be.empty
  })

  it('errors when any unknown property is set', function () {
    const errors = validateInteger({ unknown: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a number property "default"', function () {
    const errors = validateInteger({ default: 0 })
    expect(errors).to.be.empty
  })

  it('errors when default is set as a non-integer', function () {
    const errors = validateInteger({ default: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a boolean property "required"', function () {
    const errors = validateInteger({ required: true })
    expect(errors).to.be.empty
  })

  it('errors when required is set as a non-boolean', function () {
    const errors = validateInteger({ required: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a number property "minimum"', function () {
    const errors = validateInteger({ minimum: 0 })
    expect(errors).to.be.empty
  })

  it('errors when minimum is set as a non-number', function () {
    const errors = validateInteger({ minimum: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a number property "maximum"', function () {
    const errors = validateInteger({ maximum: 0 })
    expect(errors).to.be.empty
  })

  it('errors when maximum is set as a non-number', function () {
    const errors = validateInteger({ maximum: null })
    expect(errors).not.to.be.empty
  })

  it('accepts minimum < maximum', function () {
    const errors = validateInteger({ minimum: 0, maximum: 1 })
    expect(errors).to.be.empty
  })

  it('accepts minimum = maximum', function () {
    const errors = validateInteger({ minimum: 0, maximum: 0 })
    expect(errors).to.be.empty
  })

  it('errors when minimum > maximum', function () {
    const errors = validateInteger({ minimum: 1, maximum: 0 })
    expect(errors).not.to.be.empty
  })
})

describe('parseInteger', function () {
  const parseInteger = Module.parseInteger as any

  it('parses a valid integer', function () {
    const parse = parseInteger({}) as any
    const result = parse('0')
    expect(result.value).to.equal(0)
    expect(result.errors).to.be.empty
  })

  it('rejects a value of ""', function () {
    const parse = parseInteger({}) as any
    const result = parse('')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('rejects a non-integer value', function () {
    const parse = parseInteger({}) as any
    const result = parse('1.2')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('accepts a value above the minimum', function () {
    const parse = parseInteger({ minimum: 0 }) as any
    const result = parse('1')
    expect(result.value).to.equal(1)
    expect(result.errors).to.be.empty
  })

  it('accepts a value equal to the minimum', function () {
    const parse = parseInteger({ minimum: 0 }) as any
    const result = parse('0')
    expect(result.value).to.equal(0)
    expect(result.errors).to.be.empty
  })

  it('rejects a value below minimum', function () {
    const parse = parseInteger({ minimum: 1 }) as any
    const result = parse('0')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('accepts a value below the maximum', function () {
    const parse = parseInteger({ maximum: 1 }) as any
    const result = parse('0')
    expect(result.value).to.equal(0)
    expect(result.errors).to.be.empty
  })

  it('accepts a value equal to the maximum', function () {
    const parse = parseInteger({ maximum: 1 }) as any
    const result = parse('1')
    expect(result.value).to.equal(1)
    expect(result.errors).to.be.empty
  })

  it('rejects a value above maximum', function () {
    const parse = parseInteger({ maximum: 0 }) as any
    const result = parse('1')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })
})
