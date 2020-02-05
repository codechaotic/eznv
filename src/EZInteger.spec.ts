/* tslint:disable:no-unused-expression no-empty */

import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './EZInteger'
import { EZSchemaError, EZParserError } from './EZError'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('EZInteger', function () {
  const EZInteger = Module.EZInteger as any

  describe('constructor', function () {
    it('returns an EZInteger', function () {
      expect(new EZInteger()).to.be.instanceof(Module.EZInteger)
    })

    it('errors when any unknown property is set', function () {
      expect(() => new EZInteger({ unknown: null })).to.throw(EZSchemaError)
    })

    it('accepts a nullable boolean property "default"', function () {
      expect(() => new EZInteger({ default: 5 })).not.to.throw()
      expect(() => new EZInteger({ default: null })).not.to.throw()
    })

    it('errors when "default" is invalid', function () {
      expect(() => new EZInteger({ default: {} })).to.throw(EZSchemaError)
    })

    it('accepts a boolean property "required"', function () {
      expect(() => new EZInteger({ required: true })).not.to.throw()
    })

    it('errors when "required" is invalid', function () {
      expect(() => new EZInteger({ required: {} })).to.throw(EZSchemaError)
    })

    it('accepts a integer property "minimum"', function () {
      expect(() => new EZInteger({ minimum: 0 })).not.to.throw()
      expect(() => new EZInteger({ minimum: null })).not.to.throw()
    })

    it('errors when "minimum" is invalid', function () {
      expect(() => new EZInteger({ minimum: {} })).to.throw(EZSchemaError)
      expect(() => new EZInteger({ minimum: NaN })).to.throw(EZSchemaError)
      expect(() => new EZInteger({ minimum: 0.5 })).to.throw(EZSchemaError)
    })

    it('accepts a integer property "maximum"', function () {
      expect(() => new EZInteger({ maximum: 1 })).not.to.throw()
      expect(() => new EZInteger({ maximum: null })).not.to.throw()
    })

    it('errors when "maximum" is invalid', function () {
      expect(() => new EZInteger({ maximum: {} })).to.throw(EZSchemaError)
      expect(() => new EZInteger({ maximum: NaN })).to.throw(EZSchemaError)
      expect(() => new EZInteger({ maximum: 0.5 })).to.throw(EZSchemaError)
    })

    it('requires "minimum" <= "maximum"', function () {
      expect(() => new EZInteger({ minimum: 0, maximum: 1 })).not.to.throw()
      expect(() => new EZInteger({ minimum: 1, maximum: 1 })).not.to.throw()
      expect(() => new EZInteger({ minimum: 1, maximum: 0 })).to.throw(EZSchemaError)
    })
  })

  describe('parse', function () {
    it('parses an integer', function () {
      expect(new EZInteger().parse('1')).to.equal(1)
    })

    it('errors parsing an unknown value', function () {
      expect(() => new EZInteger().parse('')).to.throw(EZParserError)
      expect(() => new EZInteger().parse('1.2')).to.throw(EZParserError)
      expect(() => new EZInteger().parse('x')).to.throw(EZParserError)
    })

    it('uses minimum', function () {
      expect(() => new EZInteger({ minimum: 1 }).parse('2')).not.to.throw()
      expect(() => new EZInteger({ minimum: 1 }).parse('1')).not.to.throw()
      expect(() => new EZInteger({ minimum: 1 }).parse('0')).to.throw(EZParserError)
    })

    it('uses maximum', function () {
      expect(() => new EZInteger({ maximum: 1 }).parse('2')).to.throw(EZParserError)
      expect(() => new EZInteger({ maximum: 1 }).parse('1')).not.to.throw()
      expect(() => new EZInteger({ maximum: 1 }).parse('0')).not.to.throw()
    })
  })
})
