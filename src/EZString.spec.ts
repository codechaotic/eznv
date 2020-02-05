/* tslint:disable:no-unused-expression no-empty */

import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './EZString'
import { EZSchemaError, EZParserError } from './EZError'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('EZString', function () {
  const EZString = Module.EZString as any

  describe('constructor', function () {
    it('returns an EZString', function () {
      expect(new EZString()).to.be.instanceof(Module.EZString)
    })

    it('errors when any unknown property is set', function () {
      expect(() => new EZString({ unknown: null })).to.throw(EZSchemaError)
    })

    it('accepts a nullable boolean property "default"', function () {
      expect(() => new EZString({ default: '' })).not.to.throw()
      expect(() => new EZString({ default: null })).not.to.throw()
    })

    it('errors when "default" is invalid', function () {
      expect(() => new EZString({ default: {} })).to.throw(EZSchemaError)
    })

    it('accepts a boolean property "required"', function () {
      expect(() => new EZString({ required: true })).not.to.throw()
    })

    it('errors when "required" is invalid', function () {
      expect(() => new EZString({ required: {} })).to.throw(EZSchemaError)
    })

    it('accepts a boolean property "minLength"', function () {
      expect(() => new EZString({ minLength: 0 })).not.to.throw()
      expect(() => new EZString({ minLength: null })).not.to.throw()
    })

    it('errors when "minLength" is invalid', function () {
      expect(() => new EZString({ minLength: 0.5 })).to.throw(EZSchemaError)
      expect(() => new EZString({ minLength: NaN })).to.throw(EZSchemaError)
      expect(() => new EZString({ minLength: {} })).to.throw(EZSchemaError)
    })

    it('accepts a boolean property "maxLength"', function () {
      expect(() => new EZString({ maxLength: 1 })).not.to.throw()
      expect(() => new EZString({ maxLength: null })).not.to.throw()
    })

    it('errors when "maxLength" is invalid', function () {
      expect(() => new EZString({ maxLength: 0.5 })).to.throw(EZSchemaError)
      expect(() => new EZString({ maxLength: NaN })).to.throw(EZSchemaError)
      expect(() => new EZString({ maxLength: {} })).to.throw(EZSchemaError)
    })

    it('accepts a RegExp property "pattern"', function () {
      expect(() => new EZString({ pattern: /x/ })).not.to.throw()
    })

    it('errors when "pattern" is invalid', function () {
      expect(() => new EZString({ pattern: {} })).to.throw(EZSchemaError)
    })

    it('requires "minLength" <= "maxLength"', function () {
      expect(() => new EZString({ minLength: 0, maxLength: 1 })).not.to.throw()
      expect(() => new EZString({ minLength: 1, maxLength: 1 })).not.to.throw()
      expect(() => new EZString({ minLength: 1, maxLength: 0 })).to.throw(EZSchemaError)
    })
  })

  describe('parse', function () {
    it('parses a string', function () {
      expect(new EZString().parse('x')).to.equal('x')
    })

    it('uses minLength and maxLength', function () {
      expect(new EZString({ minLength: 1 }).parse('x')).to.equal('x')
      expect(() => new EZString({ minLength: 1 }).parse('')).to.throw(EZParserError)
      expect(new EZString({ maxLength: 0 }).parse('')).to.equal('')
      expect(() => new EZString({ maxLength: 0 }).parse('x')).to.throw(EZParserError)
    })

    it('uses pattern', function () {
      expect(new EZString({ pattern: /x/ }).parse('x')).to.equal('x')
      expect(() => new EZString({ pattern: /x/ }).parse('y')).to.throw(EZParserError)
    })
  })
})
