/* tslint:disable:no-unused-expression no-empty */

import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './EZNumber'
import { EZSchemaError, EZParserError } from './EZError'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('EZNumber', function () {
  const EZNumber = Module.EZNumber as any

  describe('constructor', function () {
    it('returns an EZNumber', function () {
      expect(new EZNumber()).to.be.instanceof(Module.EZNumber)
    })

    it('errors when any unknown property is set', function () {
      expect(() => new EZNumber({ unknown: null })).to.throw(EZSchemaError)
    })

    it('accepts a nullable boolean property "default"', function () {
      expect(() => new EZNumber({ default: 0.5 })).not.to.throw()
      expect(() => new EZNumber({ default: null })).not.to.throw()
    })

    it('errors when "default" is invalid', function () {
      expect(() => new EZNumber({ default: {} })).to.throw(EZSchemaError)
    })

    it('accepts a boolean property "required"', function () {
      expect(() => new EZNumber({ required: true })).not.to.throw()
    })

    it('errors when "required" is invalid', function () {
      expect(() => new EZNumber({ required: {} })).to.throw(EZSchemaError)
    })


    it('accepts a number property "minimum"', function () {
      expect(() => new EZNumber({ minimum: 0 })).not.to.throw()
      expect(() => new EZNumber({ minimum: null })).not.to.throw()
    })

    it('errors when "minimum" is invalid', function () {
      expect(() => new EZNumber({ minimum: {} })).to.throw(EZSchemaError)
      expect(() => new EZNumber({ minimum: NaN })).to.throw(EZSchemaError)
    })

    it('accepts a number property "maximum"', function () {
      expect(() => new EZNumber({ maximum: 1 })).not.to.throw()
      expect(() => new EZNumber({ maximum: null })).not.to.throw()
    })

    it('errors when "maximum" is invalid', function () {
      expect(() => new EZNumber({ maximum: {} })).to.throw(EZSchemaError)
      expect(() => new EZNumber({ maximum: NaN })).to.throw(EZSchemaError)
    })

    it('accepts a number property "exclusiveMinimum"', function () {
      expect(() => new EZNumber({ exclusiveMinimum: 0 })).not.to.throw()
      expect(() => new EZNumber({ exclusiveMaximum: null })).not.to.throw()
    })

    it('errors when "exclusiveMinimum" is invalid', function () {
      expect(() => new EZNumber({ exclusiveMinimum: {} })).to.throw(EZSchemaError)
      expect(() => new EZNumber({ exclusiveMinimum: NaN })).to.throw(EZSchemaError)
    })

    it('accepts a number property "exclusiveMaximum"', function () {
      expect(() => new EZNumber({ exclusiveMaximum: 1 })).not.to.throw()
      expect(() => new EZNumber({ exclusiveMaximum: null })).not.to.throw()
    })

    it('errors when "exclusiveMaximum" is invalid', function () {
      expect(() => new EZNumber({ exclusiveMaximum: {} })).to.throw(EZSchemaError)
      expect(() => new EZNumber({ exclusiveMaximum: NaN })).to.throw(EZSchemaError)
    })

    it('errors on incompatible params', function () {
      expect(() => new EZNumber({ minimum: 0, exclusiveMinimum: 0 })).to.throw(EZSchemaError)
      expect(() => new EZNumber({ maximum: 1, exclusiveMaximum: 1 })).to.throw(EZSchemaError)
    })

    it('requires "minimum" <= "maximum"', function () {
      expect(() => new EZNumber({ minimum: 0, maximum: 1 })).not.to.throw()
      expect(() => new EZNumber({ minimum: 1, maximum: 1 })).not.to.throw()
      expect(() => new EZNumber({ minimum: 1, maximum: 0 })).to.throw(EZSchemaError)
    })

    it('requires "minimum" < "exclusiveMaximum"', function () {
      expect(() => new EZNumber({ minimum: 0, exclusiveMaximum: 1 })).not.to.throw()
      expect(() => new EZNumber({ minimum: 1, exclusiveMaximum: 1 })).to.throw(EZSchemaError)
      expect(() => new EZNumber({ minimum: 1, exclusiveMaximum: 0 })).to.throw(EZSchemaError)
    })

    it('requires "exclusiveMinimum" < "maximum"', function () {
      expect(() => new EZNumber({ exclusiveMinimum: 0, maximum: 1 })).not.to.throw()
      expect(() => new EZNumber({ exclusiveMinimum: 1, maximum: 1 })).to.throw(EZSchemaError)
      expect(() => new EZNumber({ exclusiveMinimum: 1, maximum: 0 })).to.throw(EZSchemaError)
    })

    it('requires "exclusiveMinimum" <= "exclusiveMaximum"', function () {
      expect(() => new EZNumber({ exclusiveMinimum: 0, exclusiveMaximum: 1 })).not.to.throw()
      expect(() => new EZNumber({ exclusiveMinimum: 1, exclusiveMaximum: 1 })).to.throw(EZSchemaError)
      expect(() => new EZNumber({ exclusiveMinimum: 1, exclusiveMaximum: 0 })).to.throw(EZSchemaError)
    })
  })

  describe('parse', function () {
    it('parses an integer', function () {
      expect(new EZNumber().parse('0.5')).to.equal(0.5)
    })

    it('errors parsing an unknown value', function () {
      expect(() => new EZNumber().parse('')).to.throw(EZParserError)
      expect(() => new EZNumber().parse('x')).to.throw(EZParserError)
    })

    it('uses minimum', function () {
      expect(() => new EZNumber({ minimum: 1 }).parse('2')).not.to.throw()
      expect(() => new EZNumber({ minimum: 1 }).parse('1')).not.to.throw()
      expect(() => new EZNumber({ minimum: 1 }).parse('0')).to.throw(EZParserError)
    })

    it('uses maximum', function () {
      expect(() => new EZNumber({ maximum: 1 }).parse('2')).to.throw(EZParserError)
      expect(() => new EZNumber({ maximum: 1 }).parse('1')).not.to.throw()
      expect(() => new EZNumber({ maximum: 1 }).parse('0')).not.to.throw()
    })

    it('uses exclusiveMinimum', function () {
      expect(() => new EZNumber({ exclusiveMinimum: 1 }).parse('2')).not.to.throw()
      expect(() => new EZNumber({ exclusiveMinimum: 1 }).parse('1')).to.throw(EZParserError)
      expect(() => new EZNumber({ exclusiveMinimum: 1 }).parse('0')).to.throw(EZParserError)
    })

    it('uses exclusiveMaximum', function () {
      expect(() => new EZNumber({ exclusiveMaximum: 1 }).parse('2')).to.throw(EZParserError)
      expect(() => new EZNumber({ exclusiveMaximum: 1 }).parse('1')).to.throw(EZParserError)
      expect(() => new EZNumber({ exclusiveMaximum: 1 }).parse('0')).not.to.throw()
    })
  })
})
