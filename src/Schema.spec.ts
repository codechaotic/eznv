/* tslint:disable:no-unused-expression no-empty */

import * as fs from 'fs'
import * as chai from 'chai'
import * as Sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'

import * as Module from './Schema'
import * as grammar from './grammar'
import * as Number from './Number'
import * as String from './String'
import * as Integer from './Integer'
import * as Boolean from './Boolean'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('validateProperties', function () {
  let validateNumber: Sinon.SinonStub<[any], any>
  let validateString: Sinon.SinonStub<[any], any>
  let validateInteger: Sinon.SinonStub<[any], any>
  let validateBoolean: Sinon.SinonStub<[any], any>

  beforeEach(function () {
    validateNumber = Sinon.stub(Number, 'validateNumber')
    validateString = Sinon.stub(String, 'validateString')
    validateInteger = Sinon.stub(Integer, 'validateInteger')
    validateBoolean = Sinon.stub(Boolean, 'validateBoolean')
  })

  afterEach(function () {
    validateNumber.restore()
    validateString.restore()
    validateInteger.restore()
    validateBoolean.restore()
  })

  it('validates a string definition', function () {
    validateString.returns([])
    const def = { type: 'string' } as any
    const defs = { prop: def }
    const errors = Module.validateProperties(defs)
    expect(validateString).to.have.been.calledWith(def)
    expect(errors).to.be.empty
  })

  it('validates a number definition', function () {
    validateNumber.returns([])
    const def = { type: 'number' } as any
    const defs = { prop: def }
    const errors = Module.validateProperties(defs)
    expect(validateNumber).to.have.been.calledWith(def)
    expect(errors).to.be.empty
  })

  it('validates an integer definition', function () {
    validateInteger.returns([])
    const def = { type: 'integer' } as any
    const defs = { prop: def }
    const errors = Module.validateProperties(defs)
    expect(validateInteger).to.have.been.calledWith(def)
    expect(errors).to.be.empty
  })

  it('validates a boolean definition', function () {
    validateBoolean.returns([])
    const def = { type: 'boolean' } as any
    const defs = { prop: def }
    const errors = Module.validateProperties(defs)
    expect(validateBoolean).to.have.been.calledWith(def)
    expect(errors).to.be.empty
  })

  it('rejects a non-object property definition', function () {
    const def = null as any
    const defs = { prop: def }
    const errors = Module.validateProperties(defs)
    expect(errors).not.to.be.empty
  })
})

describe('createProperties', function () {
  let parseNumber: Sinon.SinonStub<[any], any>
  let parseString: Sinon.SinonStub<[any], any>
  let parseInteger: Sinon.SinonStub<[any], any>
  let parseBoolean: Sinon.SinonStub<[any], any>

  beforeEach(function () {
    parseNumber = Sinon.stub(Number, 'parseNumber')
    parseString = Sinon.stub(String, 'parseString')
    parseInteger = Sinon.stub(Integer, 'parseInteger')
    parseBoolean = Sinon.stub(Boolean, 'parseBoolean')
  })

  afterEach(function () {
    parseNumber.restore()
    parseString.restore()
    parseInteger.restore()
    parseBoolean.restore()
  })

  it('creates a string parser', function () {
    const parser = {}
    parseString.returns(parser)
    const def = { type: 'string' } as any
    const defs = { prop: def }
    const parsers = Module.createProperties(defs)
    expect(parseString).to.have.been.calledWith(def)
    expect(parsers).to.be.an('object')
    expect(parsers.prop).to.equal(parser)
  })

  it('creates a integer parser', function () {
    const parser = {}
    parseInteger.returns(parser)
    const def = { type: 'integer' } as any
    const defs = { prop: def }
    const parsers = Module.createProperties(defs)
    expect(parseInteger).to.have.been.calledWith(def)
    expect(parsers).to.be.an('object')
    expect(parsers.prop).to.equal(parser)
  })

  it('creates a boolean parser', function () {
    const parser = {}
    parseBoolean.returns(parser)
    const def = { type: 'boolean' } as any
    const defs = { prop: def }
    const parsers = Module.createProperties(defs)
    expect(parseBoolean).to.have.been.calledWith(def)
    expect(parsers).to.be.an('object')
    expect(parsers.prop).to.equal(parser)
  })

  it('creates a number parser', function () {
    const parser = {}
    parseNumber.returns(parser)
    const def = { type: 'number' } as any
    const defs = { prop: def }
    const parsers = Module.createProperties(defs)
    expect(parseNumber).to.have.been.calledWith(def)
    expect(parsers).to.be.an('object')
    expect(parsers.prop).to.equal(parser)
  })
})

describe('loadEnvFile', function () {
  let findWithSensitivity: Sinon.SinonStub<any, any>
  let readFile: Sinon.SinonStub<any, any>
  let cwd: Sinon.SinonStub<any, any>
  let parse: Sinon.SinonStub<any, any>
  let env = process.env

  beforeEach(function () {
    findWithSensitivity = Sinon.stub(Module, 'findWithSensitivity')
    readFile = Sinon.stub(fs, 'readFile')
    cwd = Sinon.stub(process, 'cwd')
    parse = Sinon.stub(grammar, 'parse')
    process.env = {}
  })

  afterEach(function () {
    findWithSensitivity.restore()
    readFile.restore()
    cwd.restore()
    parse.restore()
    process.env = env
  })

  it('loads and parses the .env file', async function () {
    cwd.returns('/')
    readFile.callsArgWith(1, null, new Buffer(''))
    parse.returns({ body: [] })

    await Module.loadEnvFile({}, {})
    expect(readFile).to.be.calledWith('/.env')
    expect(parse).to.be.calledWith('')
  })

  it('errors when loading fails', async function () {
    cwd.returns('/')
    readFile.callsArgWith(1, new Error(), null)

    const promise = Module.loadEnvFile({}, {})
    expect(promise).to.be.rejected
  })

  it('errors when parsing fails', async function () {
    cwd.returns('/')
    readFile.callsArgWith(1, null, new Buffer(''))
    parse.throws()

    const promise = Module.loadEnvFile({}, {})
    expect(promise).to.be.rejected
  })

  it('parses a literal value', async function () {
    cwd.returns('/')
    readFile.callsArgWith(1, null, new Buffer(''))
    parse.returns({
      body: [{
        lhs: 'key',
        rhs: [{
          type: 'Literal',
          value: 'value'
        }]
      }]
    })
    findWithSensitivity.withArgs('key').returns('key')
    const result = await Module.loadEnvFile({}, {})
    expect(result).to.have.property('key', 'value')
  })

  it('resolves a variable value from process.env', async function () {
    cwd.returns('/')
    readFile.callsArgWith(1, null, new Buffer(''))
    parse.returns({
      body: [{
        lhs: 'key',
        rhs: [{
          type: 'Variable',
          value: 'FAKE'
        }]
      }]
    })
    process.env.FAKE = 'value'
    findWithSensitivity.withArgs('key').returns('key')
    const result = await Module.loadEnvFile({}, {})
    expect(result).to.have.property('key', 'value')
  })

  it('errors with unknown substitution', async function () {
    cwd.returns('/')
    readFile.callsArgWith(1, null, new Buffer(''))
    parse.returns({
      body: [{
        lhs: 'key',
        rhs: [{
          type: 'Variable',
          value: 'FAKE'
        }]
      }]
    })
    findWithSensitivity.withArgs('key').returns('key')
    const promise = Module.loadEnvFile({}, {})
    await expect(promise).to.be.rejected
  })

  it('resolves a variable value from a previous value', async function () {
    cwd.returns('/')
    readFile.callsArgWith(1, null, new Buffer(''))
    parse.returns({
      body: [{
        lhs: 'key1',
        rhs: [{
          type: 'Literal',
          value: 'value'
        }]
      }, {
        lhs: 'key2',
        rhs: [{
          type: 'Variable',
          value: 'key1'
        }]
      }]
    })
    process.env.FAKE = 'value'
    findWithSensitivity.withArgs('key1').returns('key1')
    findWithSensitivity.withArgs('key2').returns('key2')
    const result = await Module.loadEnvFile({}, {})
    expect(result).to.have.property('key2', 'value')
  })

  it('errors with extra keys and ignoreExtra = false (default)', async function () {
    cwd.returns('/')
    readFile.callsArgWith(1, null, new Buffer(''))
    parse.returns({
      body: [{
        lhs: 'key',
        rhs: [{
          type: 'Literal',
          value: 'value'
        }]
      }]
    })
    findWithSensitivity.withArgs('key').returns(undefined)
    const promise = Module.loadEnvFile({}, {})
    await expect(promise).to.be.rejected
  })

  it('ignores extra keys when ignoreExtra = true', async function () {
    cwd.returns('/')
    readFile.callsArgWith(1, null, new Buffer(''))
    parse.returns({
      body: [{
        lhs: 'key',
        rhs: [{
          type: 'Literal',
          value: 'value'
        }]
      }]
    })
    findWithSensitivity.withArgs('key').returns(undefined)
    const promise = Module.loadEnvFile({ ignoreExtra: true }, {})
    await expect(promise).not.to.be.rejected
  })

})

describe('Schema', function () {
  let validateProperties: Sinon.SinonStub<any, any>
  let createProperties: Sinon.SinonStub<any, any>

  beforeEach(function () {
    validateProperties = Sinon.stub(Module, 'validateProperties')
    createProperties = Sinon.stub(Module, 'createProperties')
  })

  afterEach(function () {
    validateProperties.restore()
    createProperties.restore()
  })

  describe('constructor', function () {
    it('validates schema and generates parsers', function () {
      validateProperties.returns([])
      createProperties.returns({})
      const schema = { key: { type: 'string' } } as any
      new Module.Schema(schema)
      expect(validateProperties).to.have.been.calledWith(schema)
      expect(createProperties).to.have.been.calledWith(schema)
    })

    it('errors if definition fails validation', function () {
      validateProperties.returns([['fake','prop','sucks']])
      expect(() => new Module.Schema({})).to.throw(Module.EZNVError)
    })
  })

  describe('load', function () {
    let loadEnvFile: Sinon.SinonStub<any, any>
    let findWithSensitivity: Sinon.SinonStub<any, any>
    let parser: Sinon.SinonStub<any, any>
    let env = process.env

    beforeEach(function () {
      loadEnvFile = Sinon.stub(Module, 'loadEnvFile')
      findWithSensitivity = Sinon.stub(Module, 'findWithSensitivity')
      parser = Sinon.stub()
      process.env = { FAKE: 'value' }
    })

    afterEach(function () {
      loadEnvFile.restore()
      findWithSensitivity.restore()
      process.env = env
    })

    it('parses loaded values from the env file', async function () {
      validateProperties.returns([])
      createProperties.returns({ key: parser })
      const schema = new Module.Schema({
        key: { type: 'string' }
      })

      loadEnvFile.resolves({ key: 'value' })
      findWithSensitivity.onFirstCall().returns(undefined)
      findWithSensitivity.onSecondCall().returns('key')
      parser.withArgs('value').returns({ errors: [], value: 'value' })
      const result = await schema.load()
      expect(parser).to.have.been.calledWith('value')
      expect(result).to.have.property('key', 'value')
    })

    it('uses options matchCase', async function () {
      validateProperties.returns([])
      createProperties.returns({ key: parser })
      const schema = new Module.Schema({
        key: { type: 'string', required: false }
      })

      const file = { key: 'value' }
      loadEnvFile.resolves(file)
      await schema.load({ matchCase: false })
      expect(findWithSensitivity).to.have.been.calledWith('key', file, 'base')
      findWithSensitivity.reset()
      await schema.load({ matchCase: true })
      expect(findWithSensitivity).to.have.been.calledWith('key', file, 'variant')
    })

    it('uses process.env when mode = "default"', async function () {
      validateProperties.returns([])
      createProperties.returns({ key: parser })
      const schema = new Module.Schema({
        key: { type: 'string', required: false }
      })

      const file = {}
      loadEnvFile.resolves(file)
      process.env.KEY = 'value'
      parser.withArgs('value').returns({ errors: [], value: 'value' })
      findWithSensitivity.withArgs('key', process.env).returns('KEY')
      findWithSensitivity.withArgs('key', file).returns(undefined)
      const result = await schema.load({ mode: 'default' })
      expect(result).to.have.property('key', 'value')
    })

    it('uses process.env when mode = "no_file"', async function () {
      validateProperties.returns([])
      createProperties.returns({ key: parser })
      const schema = new Module.Schema({
        key: { type: 'string', required: false }
      })

      const file = {}
      loadEnvFile.resolves(file)
      process.env.KEY = 'value'
      parser.withArgs('value').returns({ errors: [], value: 'value' })
      findWithSensitivity.withArgs('key', process.env).returns('KEY')
      findWithSensitivity.withArgs('key', file).returns(undefined)
      const result = await schema.load({ mode: 'no_file' })
      expect(result).to.have.property('key', 'value')
    })

    it('ignores process.env when mode = "file_only"', async function () {
      validateProperties.returns([])
      createProperties.returns({ key: parser })
      const schema = new Module.Schema({
        key: { type: 'string', required: false }
      })

      const file = {}
      loadEnvFile.resolves(file)
      process.env.KEY = 'value'
      parser.withArgs('value').returns({ errors: [], value: 'value' })
      findWithSensitivity.withArgs('key', process.env).returns('KEY')
      findWithSensitivity.withArgs('key', file).returns(undefined)
      const result = await schema.load({ mode: 'file_only' })
      expect(result).to.have.property('key', null)
    })

    it('uses null when non-required properties are missing', async function () {
      validateProperties.returns([])
      createProperties.returns({ key: parser })
      const schema = new Module.Schema({
        key: { type: 'string', required: false }
      })

      loadEnvFile.resolves({})
      const result = await schema.load()
      expect(result).to.have.property('key', null)
    })

    it('errors when required properties are missing', async function () {
      validateProperties.returns([])
      createProperties.returns({ key: parser })
      const schema = new Module.Schema({
        key: { type: 'string' }
      })

      loadEnvFile.resolves({})
      const promise = schema.load()
      await expect(promise).to.be.rejected
    })

    it('uses default when provided and properties are missing', async function () {
      validateProperties.returns([])
      createProperties.returns({ key: parser })
      const schema = new Module.Schema({
        key: { type: 'string', default: 'value' }
      })

      loadEnvFile.resolves({})
      const result = await schema.load()
      await expect(result).to.have.property('key', 'value')
    })

    it('errors when parsing fails', async function () {
      validateProperties.returns([])
      createProperties.returns({ key: parser })
      const schema = new Module.Schema({
        key: { type: 'string' }
      })

      findWithSensitivity.onFirstCall().returns(undefined)
      findWithSensitivity.onSecondCall().returns('key')
      parser.returns({ errors: ['error'] })
      loadEnvFile.resolves({ key: 'value' })
      const promise = schema.load()
      await expect(promise).to.be.rejected
    })
  })
})

describe('combineErrors', function () {
  it ('combines a single error', function () {
    const message = Module.combineErrors('main', [['name','type','message']])
    expect(message).to.equal('main\n\ttype property name message')
  })

  it ('combines a multiple errors for the same property', function () {
    const message = Module.combineErrors('main', [
      ['name','type','message1', 'message2']
    ])
    expect(message).to.equal('main\n\ttype property name:\n\tmessage1\n\tmessage2')
  })

  it ('combines a multiple errors for different properties', function () {
    const message = Module.combineErrors('main', [
      ['name1','type','message'],
      ['name2','type','message']
    ])
    expect(message).to.equal('main\n\ttype property name1 message\n\n\ttype property name2 message')
  })
})

describe('findWithSensitivity', function () {
  it('finds a string using given sensitivity', function () {
    let match: string | undefined
    match = Module.findWithSensitivity('value', { value: null }, 'variant')
    expect(match).to.equal('value')
    match = Module.findWithSensitivity('value', { VALUE: null }, 'variant')
    expect(match).to.be.undefined
    match = Module.findWithSensitivity('value', { VALUE: null }, 'base')
    expect(match).to.equal('VALUE')
  })
})
