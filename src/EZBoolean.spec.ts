/* tslint:disable:no-unused-expression no-empty */

import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './EZBoolean'
import { EZSchemaError } from './EZError'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('EZBoolean', function () {
  const EZBoolean = Module.EZBoolean as any

  describe('constructor', function () {
    it('returns an EZBoolean', function () {
      expect(new EZBoolean()).to.be.instanceof(Module.EZBoolean)
    })

    it('errors when any unknown property is set', function () {
      expect(() => new EZBoolean({ unknown: null })).to.throw(EZSchemaError)
    })

    it('accepts a nullable boolean property "default"', function () {
      expect(() => new EZBoolean({ default: true })).not.to.throw()
      expect(() => new EZBoolean({ default: null })).not.to.throw()
    })

    it('errors when "default" is invalid', function () {
      expect(() => new EZBoolean({ default: {} })).to.throw(EZSchemaError)
    })

    it('accepts a boolean property "required"', function () {
      expect(() => new EZBoolean({ required: true })).not.to.throw()
    })

    it('errors when "required" is invalid', function () {
      expect(() => new EZBoolean({ required: {} })).to.throw(EZSchemaError)
    })

    it('accepts an boolean property "strictCase"', function () {
      expect(() => new EZBoolean({ strictCase: true })).not.to.throw()
    })

    it('errors when "strictCase" is invalid', function () {
      expect(() => new EZBoolean({ strictCase: {} })).to.throw(EZSchemaError)
    })

    it('accepts an array property "falseyValues"', function () {
      expect(() => new EZBoolean({ falseyValues: ['x'] })).not.to.throw()
    })

    it('errors when "falseyValues" is invalid', function () {
      expect(() => new EZBoolean({ falseyValues: {} })).to.throw(EZSchemaError)
      expect(() => new EZBoolean({ falseyValues: [{}] })).to.throw(EZSchemaError)
    })

    it('errors when "falseyValues" are not unique', function () {
      expect(() => new EZBoolean({ falseyValues: ['x', 'x'], strictCase: false })).to.throw(EZSchemaError)
      expect(() => new EZBoolean({ falseyValues: ['x', 'X'], strictCase: false })).to.throw(EZSchemaError)
      expect(() => new EZBoolean({ falseyValues: ['x', 'x'], strictCase: true })).to.throw(EZSchemaError)
      expect(() => new EZBoolean({ falseyValues: ['x', 'X'], strictCase: true })).not.to.throw()
    })

    it('accepts an array property "truthyValues"', function () {
      expect(() => new EZBoolean({ truthyValues: ['x'] })).not.to.throw()
    })

    it('errors when "truthyValues" is invalid', function () {
      expect(() => new EZBoolean({ truthyValues: {} })).to.throw(EZSchemaError)
      expect(() => new EZBoolean({ truthyValues: [{}] })).to.throw(EZSchemaError)
    })

    it('errors when "truthyValues" are not unique', function () {
      expect(() => new EZBoolean({ truthyValues: ['x', 'x'], strictCase: false })).to.throw(EZSchemaError)
      expect(() => new EZBoolean({ truthyValues: ['x', 'X'], strictCase: false })).to.throw(EZSchemaError)
      expect(() => new EZBoolean({ truthyValues: ['x', 'x'], strictCase: true })).to.throw(EZSchemaError)
      expect(() => new EZBoolean({ truthyValues: ['x', 'X'], strictCase: true })).not.to.throw()
    })

    it('errors when "truthyValues" and "falseyValues" overlap', function () {
      expect(() => new EZBoolean({ truthyValues: ['x'], falseyValues: ['X'], strictCase: false })).to.throw(EZSchemaError)
      expect(() => new EZBoolean({ truthyValues: ['x'], falseyValues: ['X'], strictCase: true })).not.to.throw()
    })
  })

  describe('parse', function () {
    it('parses a boolean', function () {
      expect(new EZBoolean().parse('true')).to.be.true
      expect(new EZBoolean().parse('false')).to.be.false
    })

    it('errors parsing an unknown value', function () {
      expect(() => new EZBoolean().parse('x')).to.throw()
    })

    it('uses strictCase', function () {
      expect(() => new EZBoolean({ strictCase: false }).parse('TRUE')).not.to.throw()
      expect(() => new EZBoolean({ strictCase: true }).parse('TRUE')).to.throw()
      expect(() => new EZBoolean({ strictCase: false }).parse('true')).not.to.throw()
      expect(() => new EZBoolean({ strictCase: true }).parse('true')).not.to.throw()
    })

    it('uses falseyValues and truthyValues', function () {
      expect(new EZBoolean({ falseyValues: ['no'] }).parse('no')).to.be.false
      expect(new EZBoolean({ truthyValues: ['yes'] }).parse('yes')).to.be.true
    })
  })
})
