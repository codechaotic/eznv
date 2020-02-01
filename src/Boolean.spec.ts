/* tslint:disable:no-unused-expression no-empty */

import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './Boolean'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('BooleanProperty', function () {
  it('returns an BooleanProperty', function () {
    const value = new Module.BooleanProperty({})
    expect(value.type).to.equal('boolean')
    expect(value).to.be.instanceof(Module.BooleanProperty)
  })
})

describe('validateBoolean', function () {
  const validateBoolean = Module.validateBoolean as any

  it('returns an array', function () {
    const errors = validateBoolean({})
    expect(errors).to.be.an('array')
    expect(errors).to.be.empty
  })

  it('accepts "type" === "boolean"', function () {
    const errors = validateBoolean({ type: 'boolean' })
    expect(errors).to.be.empty
  })

  it('errors when "type" !== "boolean"', function () {
    const errors = validateBoolean({ type: 'string' })
    expect(errors).not.to.be.empty
  })

  it('errors when any unknown property is set', function () {
    const errors = validateBoolean({ unknown: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a boolean property "default"', function () {
    const errors = validateBoolean({ default: true })
    expect(errors).to.be.empty
  })

  it('errors when "default" is set as a non-boolean', function () {
    const errors = validateBoolean({ default: null })
    expect(errors).not.to.be.empty
  })

  it('accepts a boolean property "required"', function () {
    const errors = validateBoolean({ required: true })
    expect(errors).to.be.empty
  })

  it('errors when "required" is set as a non-boolean', function () {
    const errors = validateBoolean({ required: null })
    expect(errors).not.to.be.empty
  })

  it('accepts an boolean property "strictCase"', function () {
    const errors = validateBoolean({ strictCase: true })
    expect(errors).to.be.empty
  })

  it('errors when "strictCase" is set as a non-boolean', function () {
    const errors = validateBoolean({ strictCase: null })
    expect(errors).not.to.be.empty
  })

  it('accepts an array property "falseyValues"', function () {
    const errors = validateBoolean({ falseyValues: ['x'] })
    expect(errors).to.be.empty
  })

  it('errors when "falseyValues" is set as a non-array', function () {
    const errors = validateBoolean({ falseyValues: 'x' })
    expect(errors).not.to.be.empty
  })

  it('errors when "falseyValues" contains non-strings', function () {
    const errors = validateBoolean({ falseyValues: [5, 'x', 8] })
    expect(errors).not.to.be.empty
  })

  it('errors when "falseyValues" are not unique', function () {
    const looseErrors = validateBoolean({
      falseyValues: ['x', 'X'],
      strictCase: false
    })
    const strictErrors = validateBoolean({
      falseyValues: ['x', 'X'],
      strictCase: true
    })
    expect(looseErrors).not.to.be.empty
    expect(strictErrors).to.be.empty
  })

  it('accepts an array property "truthyValues"', function () {
    const errors = validateBoolean({ falseyValues: ['x'] })
    expect(errors).to.be.empty
  })

  it('errors when "truthyValues" is set as a non-array', function () {
    const errors = validateBoolean({ truthyValues: 'x' })
    expect(errors).not.to.be.empty
  })

  it('errors when "truthyValues" contains non-strings', function () {
    const errors = validateBoolean({ truthyValues: [5, 'x', 8] })
    expect(errors).not.to.be.empty
  })

  it('errors when "truthyValues" are not unique', function () {
    const looseErrors = validateBoolean({
      truthyValues: ['x', 'X'],
      strictCase: false
    })
    const strictErrors = validateBoolean({
      truthyValues: ['x', 'X'],
      strictCase: true
    })
    expect(looseErrors).not.to.be.empty
    expect(strictErrors).to.be.empty
  })

  it('errors when "truthyValues" and "falseyValues" overlap', function () {
    const looseErrors = validateBoolean({
      truthyValues: ['x'],
      falseyValues: ['X'],
      strictCase: false
    })
    const strictErrors = validateBoolean({
      truthyValues: ['x'],
      falseyValues: ['X'],
      strictCase: true
    })
    expect(looseErrors).not.to.be.empty
    expect(strictErrors).to.be.empty
  })
})

describe('parseBoolean', function () {
  const parseBoolean = Module.parseBoolean as any

  it('parses a valid boolean', function () {
    const parse = parseBoolean({}) as any
    const truthyResult = parse('true')
    const falseyResult = parse('false')
    expect(truthyResult.value).to.be.true
    expect(truthyResult.errors).to.be.empty
    expect(falseyResult.value).to.be.false
    expect(falseyResult.errors).to.be.empty
  })

  it('parses strictly when "strictCase" = true', function () {
    const looseParse = parseBoolean({
      strictCase: false
    }) as any
    const strictParse = parseBoolean({
      strictCase: true
    }) as any
    const looseResult = looseParse('TRUE')
    const strictResult = strictParse('TRUE')
    expect(looseResult.value).to.be.true
    expect(looseResult.errors).to.be.empty
    expect(strictResult.value).to.be.undefined
    expect(strictResult.errors).not.to.be.empty
  })

  it('errors for an unrecognized value', function () {
    const parse = parseBoolean({}) as any
    const result = parse('x')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })

  it('errors for an ambiguous value', function () {
    const parse = parseBoolean({
      truthyValues: ['x'],
      falseyValues: ['x']
    }) as any
    const result = parse('x')
    expect(result.value).to.be.undefined
    expect(result.errors).not.to.be.empty
  })
})
