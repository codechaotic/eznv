/* tslint:disable:no-unused-expression no-empty */

import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './Number'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('NumberProperty', function () {
  it('returns a NumberProperty', function () {
    const value = new Module.NumberProperty({})
    expect(value.type).to.equal('number')
    expect(value).to.be.instanceof(Module.NumberProperty)
  })
})

describe('validateNumber', function () {
  const validateNumber = Module.validateNumber as any

  it('returns an array', function () {
    const errors = validateNumber({})
    expect(errors).to.be.an('array')
    expect(errors).to.be.empty
  })

  it('accepts type === "number"', function () {
    const errors = validateNumber({ type: 'number' })
    expect(errors).to.be.empty
  })

  it('errors when type !== "number"', function () {
    const errors = validateNumber({ type: 'string' })
    expect(errors).not.to.be.empty
  })

  it('errors when any unknown property is set', function () {
    const errors = validateNumber({ unknown: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a number property "default"', function () {
    const errors = validateNumber({ default: 0 })
    expect(errors).to.be.empty
  })

  it('errors when default is set as a non-number', function () {
    const errors = validateNumber({ default: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a boolean property "required"', function () {
    const errors = validateNumber({ required: true })
    expect(errors).to.be.empty
  })

  it('errors when required is set as a non-boolean', function () {
    const errors = validateNumber({ required: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a number property "minimum"', function () {
    const errors = validateNumber({ minimum: 0 })
    expect(errors).to.be.empty
  })

  it('errors when minimum is set as a non-number', function () {
    const errors = validateNumber({ minimum: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a number property "maximum"', function () {
    const errors = validateNumber({ maximum: 0 })
    expect(errors).to.be.empty
  })

  it('errors when maximum is set as a non-number', function () {
    const errors = validateNumber({ maximum: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a number property "exclusiveMinimum"', function () {
    const errors = validateNumber({ exclusiveMinimum: 0 })
    expect(errors).to.be.empty
  })

  it('errors when exclusiveMinimum is set as a non-number', function () {
    const errors = validateNumber({ exclusiveMinimum: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a number property "exclusiveMinimum"', function () {
    const errors = validateNumber({ exclusiveMinimum: 0 })
    expect(errors).to.be.empty
  })

  it('errors when exclusiveMaximum is set as a non-number', function () {
    const errors = validateNumber({ exclusiveMaximum: null })
    expect(errors).not.to.be.empty
  })

  it('errors when minimum and exclusiveMinimum are both set', function () {
    const errors = validateNumber({ minimum: 0, exclusiveMinimum: 0 })
    expect(errors).not.to.be.empty
  })

  it('errors when maximum and exclusiveMaximum are both set', function () {
    const errors = validateNumber({ maximum: 0, exclusiveMaximum: 0 })
    expect(errors).not.to.be.empty
  })

  it('accepts minimum < maximum', function () {
    const errors = validateNumber({ minimum: 0, maximum: 1 })
    expect(errors).to.be.empty
  })

  it('accepts minimum = maximum', function () {
    const errors = validateNumber({ minimum: 0, maximum: 0 })
    expect(errors).to.be.empty
  })

  it('errors when minimum > maximum', function () {
    const errors = validateNumber({ minimum: 1, maximum: 0 })
    expect(errors).not.to.be.empty
  })

  it('accepts minimum < exclusiveMaximum', function () {
    const errors = validateNumber({ minimum: 0, exclusiveMaximum: 1 })
    expect(errors).to.be.empty
  })

  it('errors when minimum = exclusiveMaximum', function () {
    const errors = validateNumber({ minimum: 0, exclusiveMaximum: 0 })
    expect(errors).not.to.be.empty
  })

  it('errors when minimum > exclusiveMaximum', function () {
    const errors = validateNumber({ minimum: 1, exclusiveMaximum: 0 })
    expect(errors).not.to.be.empty
  })

  it('accepts exclusiveMinimum < maximum', function () {
    const errors = validateNumber({ exclusiveMinimum: 0, maximum: 1 })
    expect(errors).to.be.empty
  })

  it('errors when exclusiveMinimum = maximum', function () {
    const errors = validateNumber({ exclusiveMinimum: 0, maximum: 0 })
    expect(errors).not.to.be.empty
  })

  it('errors when exclusiveMinimum > maximum', function () {
    const errors = validateNumber({ exclusiveMinimum: 1, maximum: 0 })
    expect(errors).not.to.be.empty
  })

  it('accepts exclusiveMinimum < exclusiveMaximum', function () {
    const errors = validateNumber({ exclusiveMinimum: 0, exclusiveMaximum: 1 })
    expect(errors).to.be.empty
  })

  it('errors when exclusiveMinimum = exclusiveMaximum', function () {
    const errors = validateNumber({ exclusiveMinimum: 0, exclusiveMaximum: 0 })
    expect(errors).not.to.be.empty
  })

  it('errors when exclusiveMinimum > exclusiveMaximum', function () {
    const errors = validateNumber({ exclusiveMinimum: 1, exclusiveMaximum: 0 })
    expect(errors).not.to.be.empty
  })
})

describe('parseNumber', function () {
  const parseNumber = Module.parseNumber as any

  it('parses a valid number', function () {
    const parse = parseNumber({}) as any
    const result = parse('0')
    expect(result.value).to.equal(0)
    expect(result.errors).to.be.empty
  })

  it('rejects a value of ""', function () {
    const parse = parseNumber({}) as any
    const result = parse('')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('rejects a non-number value', function () {
    const parse = parseNumber({}) as any
    const result = parse('x')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('accepts a value above the minimum', function () {
    const parse = parseNumber({ minimum: 0 }) as any
    const result = parse('1')
    expect(result.value).to.equal(1)
    expect(result.errors).to.be.empty
  })

  it('accepts a value equal to the minimum', function () {
    const parse = parseNumber({ minimum: 0 }) as any
    const result = parse('0')
    expect(result.value).to.equal(0)
    expect(result.errors).to.be.empty
  })

  it('rejects a value below minimum', function () {
    const parse = parseNumber({ minimum: 1 }) as any
    const result = parse('0')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('accepts a value below the maximum', function () {
    const parse = parseNumber({ maximum: 1 }) as any
    const result = parse('0')
    expect(result.value).to.equal(0)
    expect(result.errors).to.be.empty
  })

  it('accepts a value equal to the maximum', function () {
    const parse = parseNumber({ maximum: 1 }) as any
    const result = parse('1')
    expect(result.value).to.equal(1)
    expect(result.errors).to.be.empty
  })

  it('rejects a value above maximum', function () {
    const parse = parseNumber({ maximum: 0 }) as any
    const result = parse('1')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('accepts a value above the exclusiveMinimum', function () {
    const parse = parseNumber({ exclusiveMinimum: 0 }) as any
    const result = parse('1')
    expect(result.value).to.equal(1)
    expect(result.errors).to.be.empty
  })

  it('rejects a value below exclusiveMinimum', function () {
    const parse = parseNumber({ exclusiveMinimum: 1 }) as any
    const result = parse('0')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('rejects a value equal to exclusiveMinimum', function () {
    const parse = parseNumber({ exclusiveMinimum: 1 }) as any
    const result = parse('1')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('accepts a value below the exclusiveMaximum', function () {
    const parse = parseNumber({ exclusiveMaximum: 1 }) as any
    const result = parse('0')
    expect(result.value).to.equal(0)
    expect(result.errors).to.be.empty
  })

  it('rejects a value above exclusiveMaximum', function () {
    const parse = parseNumber({ exclusiveMaximum: 0 }) as any
    const result = parse('1')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('rejects a value equal to exclusiveMaximum', function () {
    const parse = parseNumber({ exclusiveMaximum: 0 }) as any
    const result = parse('0')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })
})
