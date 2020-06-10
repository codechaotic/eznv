/* tslint:disable:no-unused-expression no-empty await-promise */

import * as fs from 'fs'
import * as chai from 'chai'
import * as Sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './EZSchema'
import * as grammar from './grammar'
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

  describe('parseLoadOptions', function () {
    let cwd: Sinon.SinonStub

    beforeEach(function () {
      cwd = Sinon.stub(process, 'cwd')
      cwd.returns('/')
    })

    afterEach(function () {
      cwd.restore()
    })

    it('defaults to mode "file_first"', function () {
      const schema = new EZSchema()
      expect(schema.parseLoadOptions()).to.have.property('mode', 'file_first')
    })

    it('accepts option mode', function () {
      const schema = new EZSchema()
      expect(schema.parseLoadOptions({ mode: 'no_file' })).to.have.property('mode', 'no_file')
      expect(schema.parseLoadOptions({ mode: 'file_only' })).to.have.property('mode', 'file_only')
    })

    it('defaults to sensitivity "base"', function () {
      const schema = new EZSchema()
      expect(schema.parseLoadOptions()).to.have.property('sensitivity', 'base')
    })

    it('accepts option matchCase', function () {
      const schema = new EZSchema()
      expect(schema.parseLoadOptions({ matchCase: true })).to.have.property('sensitivity', 'variant')
      expect(schema.parseLoadOptions({ matchCase: false })).to.have.property('sensitivity', 'base')
    })

    it('defaults to filepath $PWD/.env', function () {
      const schema = new EZSchema()
      expect(schema.parseLoadOptions()).to.have.property('filepath', '/.env')
    })

    it('accepts option cwd', function () {
      const schema = new EZSchema()
      expect(schema.parseLoadOptions({ cwd: '/test' })).to.have.property('filepath', '/test/.env')
    })

    it('accepts option file', function () {
      const schema = new EZSchema()
      expect(schema.parseLoadOptions({ file: 'myenv' })).to.have.property('filepath', '/myenv')
    })
  })

  describe('resolveEnv', function () {
    let options: any
    let env = process.env

    beforeEach(function () {
      options = {}
      process.env = {}
    })

    afterEach(function () {
      process.env = env
    })

    it('parses variables from the parsed file', function () {
      const parser = Sinon.stub().withArgs('RAW').returns('VAL')
      const schema = new EZSchema({
        KEY: {
          type: 'string',
          default: null,
          required: true,
          parse: parser
        }
      })

      options.mode = 'file_first'
      expect(schema.resolveEnv({ SKIP: '', KEY: 'RAW' }, options)).to.have.property('KEY', 'VAL')

      options.mode = 'file_only'
      expect(schema.resolveEnv({ SKIP: '', KEY: 'RAW' }, options)).to.have.property('KEY', 'VAL')
    })

    it('parses variables directly from process.env when mode != "file_only"', async function () {
      process.env.SKIP = ''
      process.env.KEY = 'RAW'
      const parser = Sinon.stub().withArgs('RAW').returns('VAL')
      const schema = new EZSchema({
        KEY: {
          type: 'string',
          default: null,
          required: true,
          parse: parser
        }
      })

      options.mode = 'file_first'
      expect(schema.resolveEnv(null, options)).to.have.property('KEY', 'VAL')

      options.mode = 'no_file'
      expect(schema.resolveEnv(null, options)).to.have.property('KEY', 'VAL')
    })

    it('defaults to null when a property is not required', async function () {
      const schema = new EZSchema({
        KEY: {
          type: 'string',
          default: null,
          required: false,
          parse: Sinon.stub()
        }
      })

      expect(schema.resolveEnv(null, options)).to.have.property('KEY', null)
    })

    it('uses default if provided', async function () {
      const schema = new EZSchema({
        KEY: {
          type: 'string',
          default: 'VAL',
          required: false,
          parse: Sinon.stub()
        }
      })

      expect(schema.resolveEnv(null, options)).to.have.property('KEY', 'VAL')
    })

    it('errors when a property is required and missing', async function () {
      const schema = new EZSchema({
        KEY: {
          type: 'string',
          default: null,
          required: true,
          parse: Sinon.stub()
        }
      })

      expect(() => schema.resolveEnv(null, options)).to.throw(EZLoaderError)
    })
  })

  describe('parseFile', function () {
    let parse: Sinon.SinonStub
    let options: any
    let env = process.env

    beforeEach(function () {
      parse = Sinon.stub(grammar, 'parse')
      options = {
        mode: 'file_first',
        sensitivity: 'base'
      }
      process.env = {}
    })

    afterEach(function () {
      parse.restore()
      process.env = env
    })

    it('uses a literal value', async function () {
      const schema = new EZSchema({ KEY: null })

      parse.returns({
        body: [{
          lhs: 'KEY',
          rhs: [{ type: 'Literal', value: 'VAL' }]
        }]
      })

      expect(schema.parseFile('', options)).to.have.property('KEY', 'VAL')
    })

    it('substitutes a variable from process.env', async function () {
      const schema = new EZSchema({ KEY: null })
      process.env.VAR = 'VAL'

      parse.returns({
        body: [{
          lhs: 'KEY',
          rhs: [{ type: 'Variable', value: 'VAR' }]
        }]
      })

      expect(schema.parseFile('', options)).to.have.property('KEY', 'VAL')
    })

    it('substitutes a variable from a preceding variable', async function () {
      const schema = new EZSchema({ KEY1: null, KEY2: null })
      parse.returns({
        body: [{
          lhs: 'KEY1',
          rhs: [{ type: 'Literal', value: 'VAL' }]
        }, {
          lhs: 'KEY2',
          rhs: [{ type: 'Variable', value: 'KEY1' }]
        }]
      })

      const opts = {
        mode: 'file_first',
        sensitivity: 'base'
      }

      expect(schema.parseFile('', options)).to.have.property('KEY2', 'VAL')
    })

    it('ignores case in substitutions when sensitivity = "base"', function () {
      const schema = new EZSchema({ KEY2: null })
      process.env.key1 = 'RES'
      parse.returns({
        body: [{
          lhs: 'key2',
          rhs: [{ type: 'Variable', value: 'KEY1' }]
        }]
      })
      expect(schema.parseFile('', options)).to.have.property('KEY2', 'RES')
    })

    it('errors on case missmatch in substitutions when sensitivity = "variant"', function () {
      const schema = new EZSchema({ KEY2: null })
      process.env.key1 = 'RES'
      parse.returns({
        body: [{
          lhs: 'key2',
          rhs: [{ type: 'Variable', value: 'KEY1' }]
        }]
      })

      options.sensitivity = 'variant'
      expect(() => schema.parseFile('', options)).to.throw(EZLoaderError)
    })

    it('errors with unknown substitution', async function () {
      const schema = new EZSchema({ KEY: null })
      parse.returns({
        body: [{
          lhs: 'KEY',
          rhs: [{ type: 'Variable', value: 'NO_VAR' }]
        }]
      })

      expect(() => schema.parseFile('', options)).to.throw(EZLoaderError)
    })

    it('errors with defined variable in env but mode = "file_only"', async function () {
      const schema = new EZSchema({ KEY2: null })
      process.env.key1 = 'RES'
      parse.returns({
        body: [{
          lhs: 'key2',
          rhs: [{ type: 'Variable', value: 'KEY1' }]
        }]
      })
      options.mode = 'file_only'
      expect(() => schema.parseFile('', options)).to.throw(EZLoaderError)
    })

    it('ignores case when sensitivity = "base"', async function () {
      const schema = new EZSchema({ KEY: null })
      parse.returns({
        body: [{
          lhs: 'key',
          rhs: [{ type: 'Literal', value: 'RES' }]
        }]
      })
      expect(schema.parseFile('', options)).to.have.property('KEY', 'RES')
    })

    it('errors with case missmatch and sensitivity = "variant"', async function () {
      const schema = new EZSchema({ KEY: null })
      parse.returns({
        body: [{
          lhs: 'key',
          rhs: [{ type: 'Literal', value: 'RES' }]
        }]
      })
      options.sensitivity = 'variant'
      expect(() => schema.parseFile('', options)).to.throw(EZLoaderError)
    })

    it('errors when grammar parsing fails', function () {
      const schema = new EZSchema()
      parse.throws(new Error())
      expect(() => schema.parseFile('', options)).to.throw(EZLoaderError)
    })
  })

  describe('loadSync', function () {
    let schema: any
    let parseFile: Sinon.SinonStub
    let resolveEnv: Sinon.SinonStub
    let readFileSync: Sinon.SinonStub

    beforeEach(function () {
      schema = new EZSchema()
      parseFile = Sinon.stub(schema, 'parseFile')
      resolveEnv = Sinon.stub(schema, 'resolveEnv')
      readFileSync = Sinon.stub(fs, 'readFileSync')
    })

    afterEach(function () {
      parseFile.restore()
      resolveEnv.restore()
      readFileSync.restore()
    })

    it('uses readFileSync', function () {
      readFileSync.returns(Buffer.from(''))
      schema.loadSync()
      expect(readFileSync).to.have.been.called
    })

    it('errors when loading fails and mode = "file_only"', function () {
      readFileSync.throws(new Error())
      expect(() => schema.loadSync({ mode: 'file_only' })).to.throw(EZLoaderError)
    })

    it('ignores load errors when mode = "file_first"', function () {
      readFileSync.throws(new Error())
      expect(() => schema.loadSync({ mode: 'file_first' })).not.to.throw
    })

    it('skips loading file when mode = "no_file"', function () {
      readFileSync.returns(Buffer.from(''))
      schema.loadSync({ mode: 'no_file' })
      expect(readFileSync).not.to.have.been.called
    })

    it('skips loading file when missing and mode = "file_first"', function () {
      readFileSync.throws(new Error())
      schema.loadSync({ mode: 'file_first' })
      expect(parseFile).not.to.have.been.called
    })

    it('errors when parsing fails', function () {
      readFileSync.returns(Buffer.from(''))
      parseFile.throws(new Error())
      expect(() => schema.loadSync({ mode: 'file_only' })).to.throw
    })
  })

  describe('load', function () {
    let schema: any
    let parseFile: Sinon.SinonStub
    let resolveEnv: Sinon.SinonStub
    let readFile: Sinon.SinonStub

    beforeEach(function () {
      schema = new EZSchema()
      parseFile = Sinon.stub(schema, 'parseFile')
      resolveEnv = Sinon.stub(schema, 'resolveEnv')
      readFile = Sinon.stub(fs, 'readFile')
    })

    afterEach(function () {
      parseFile.restore()
      resolveEnv.restore()
      readFile.restore()
    })

    it('uses readFile', async function () {
      readFile.callsArgWith(2, null, Buffer.from(''))
      await schema.load()
      expect(readFile).to.have.been.called
    })

    it('errors when loading fails and mode = "file_only"', async function () {
      readFile.callsArgWith(2, new Error(), null)
      await expect(schema.load({ mode: 'file_only' })).to.be.rejectedWith(EZLoaderError)
    })

    it('ignores load errors when mode = "file_first"', async function () {
      readFile.callsArgWith(2, new Error(), null)
      await expect(schema.load({ mode: 'file_first' })).not.to.be.rejected
    })

    it('skips loading file when mode = "no_file"', async function () {
      readFile.callsArgWith(2, null, Buffer.from(''))
      await schema.load({ mode: 'no_file' })
      expect(readFile).not.to.have.been.called
    })

    it('skips loading file when missing and mode = "file_first"', async function () {
      readFile.callsArgWith(2, new Error(), null)
      await schema.load({ mode: 'file_first' })
      expect(parseFile).not.to.have.been.called
    })

    it('errors when parsing fails', async function () {
      readFile.callsArgWith(2, null, Buffer.from(''))
      parseFile.throws(new Error())
      await expect(schema.load({ mode: 'file_only' })).to.be.rejected
    })
  })
})
