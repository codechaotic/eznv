/* tslint:disable:no-unused-expression no-empty */

import * as fs from 'fs'
import * as chai from 'chai'
import * as Sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './EZSchema'
import * as grammar from './grammar'
import * as EZNumber from './EZNumber'
import * as EZString from './EZString'
import * as EZInteger from './EZInteger'
import * as EZBoolean from './EZBoolean'
import { EZLoaderError } from './EZError'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('EZSchema', function () {
  const EZSchema = Module.EZSchema as any

  describe('constructor', function () {
    it('returns an EZSchema', function () {
      expect(new EZSchema()).to.be.instanceof(Module.EZSchema)
    })
  })

  describe('load', function () {
    let readFile: Sinon.SinonStub<any, any>
    let cwd: Sinon.SinonStub<any, any>
    let parseFile: Sinon.SinonStub<any, any>
    let parseString: Sinon.SinonStub<any, any>
    let document: any
    let properties: any
    let env = process.env

    beforeEach(function () {
      document = { body: [] }
      properties = {}
      process.env = {}
      readFile = Sinon.stub(fs, 'readFile')
      readFile.callsArgWith(1, null, new Buffer('FAKE'))
      cwd = Sinon.stub(process, 'cwd').returns('/')
      parseFile = Sinon.stub(grammar, 'parse')
      parseFile.returns(document)
      parseString = Sinon.stub().withArgs('RAW').returns('RES')
    })

    afterEach(function () {
      process.env = env
      readFile.restore()
      cwd.restore()
      parseFile.restore()
    })

    it('loads and parses the .env file', async function () {
      await new EZSchema().load({})
      expect(readFile).to.be.calledWith('/.env')
      expect(parseFile).to.be.calledWith('FAKE')
    })

    it('skips loading if mode = "no_file"', async function () {
      await new EZSchema().load({ mode: 'no_file' })
      expect(readFile).not.to.be.called
      expect(parseFile).not.to.be.called
    })

    it('errors when loading fails and mode = "file_only"', async function () {
      readFile.callsArgWith(1, new Error(), null)
      await expect(new EZSchema().load({ mode: 'file_only' })).to.be.rejectedWith(EZLoaderError)
    })

    it('skips loading when loading fails and mode = "default"', async function () {
      readFile.callsArgWith(1, new Error(), null)
      await expect(new EZSchema().load({ mode: 'default' })).not.to.be.rejected
    })

    it('errors when parsing fails', async function () {
      parseFile.throws(new Error())
      await expect(new EZSchema().load({})).to.be.rejectedWith(EZLoaderError)
    })

    it('uses a literal value', async function () {
      properties.KEY = { type: 'string', default: null, required: true, parse: parseString }
      document.body.push({
        lhs: 'KEY',
        rhs: [{
          type: 'Literal',
          value: 'RAW'
        }]
      })
      expect(await new EZSchema(properties).load({})).to.have.property('KEY', 'RES')
    })

    it('substitutes a variable from process.env', async function () {
      properties.KEY = { type: 'string', default: null, required: true, parse: parseString }
      process.env.VAR = 'RAW'
      document.body.push({
        lhs: 'KEY',
        rhs: [{
          type: 'Variable',
          value: 'VAR'
        }]
      })
      expect(await new EZSchema(properties).load({})).to.have.property('KEY', 'RES')
    })

    it('substitutes a variable from a preceding variable', async function () {
      properties.KEY1 = { type: 'string', default: null, required: true, parse: parseString }
      properties.KEY2 = { type: 'string', default: null, required: true, parse: parseString }
      document.body.push({
        lhs: 'KEY1',
        rhs: [{
          type: 'Literal',
          value: 'RAW'
        }]
      })
      document.body.push({
        lhs: 'KEY2',
        rhs: [{
          type: 'Variable',
          value: 'KEY1'
        }]
      })
      expect(await new EZSchema(properties).load({})).to.have.property('KEY2', 'RES')
    })

    it('errors with unknown substitution', async function () {
      properties.KEY = { type: 'string', default: null, required: true, parse: parseString }
      document.body.push({
        lhs: 'KEY',
        rhs: [{
          type: 'Variable',
          value: 'NO_VAR'
        }]
      })
      await expect(new EZSchema(properties).load({})).to.be.rejected
    })

    it('parses variables directly from process.env', async function () {
      properties.KEY = { type: 'string', default: null, required: true, parse: parseString }
      process.env.KEY = 'RES'
      expect(await new EZSchema(properties).load({ mode: 'no_file' })).to.have.property('KEY', 'RES')
      expect(await new EZSchema(properties).load({ mode: 'default' })).to.have.property('KEY', 'RES')
      await expect(new EZSchema(properties).load({ mode: 'file_only' })).to.be.rejectedWith(EZLoaderError)
    })

    it('uses option matchCase', async function () {
      properties.KEY = { type: 'string', default: null, required: true, parse: parseString }
      document.body.push({
        lhs: 'key',
        rhs: [{
          type: 'Literal',
          value: 'RES'
        }]
      })
      expect(await new EZSchema(properties).load({ matchCase: false })).to.have.property('KEY', 'RES')
      await expect(new EZSchema(properties).load({ matchCase: true })).to.be.rejectedWith(EZLoaderError)

      document.body = []
      process.env.key = 'RES'
      expect(await new EZSchema(properties).load({ matchCase: false })).to.have.property('KEY', 'RES')
      await expect(new EZSchema(properties).load({ matchCase: true })).to.be.rejectedWith(EZLoaderError)
    })

    it('uses ignoreExtra', async function () {
      document.body.push({
        lhs: 'KEY',
        rhs: [{
          type: 'Literal',
          value: 'RES'
        }]
      })
      expect(await new EZSchema(properties).load({ ignoreExtra: true })).to.deep.equal({})
      await expect(new EZSchema(properties).load({ ignoreExtra: false })).to.be.rejectedWith(EZLoaderError)
    })

    it('defaults to null when a property is not required', async function () {
      properties.KEY = { type: 'string', default: null, required: false, parse: parseString }
      expect(await new EZSchema(properties).load()).to.have.property('KEY', null)
    })

    it('uses default if provided', async function () {
      properties.KEY = { type: 'string', default: 'DEF', required: false, parse: parseString }
      expect(await new EZSchema(properties).load()).to.have.property('KEY', 'DEF')
    })

    it('errors when a property is required and missing', async function () {
      properties.KEY = { type: 'string', default: null, required: true, parse: parseString }
      await expect(new EZSchema(properties).load()).to.be.rejectedWith(EZLoaderError)
    })
  })
})
