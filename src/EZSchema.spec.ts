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

    it('errors when loading fails', async function () {
      readFile.callsArgWith(1, new Error(), null)
      await expect(new EZSchema().load({})).to.be.rejectedWith(EZLoaderError)
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

// describe('loadEnvFile', function () {

// describe('Schema', function () {
//   let validateProperties: Sinon.SinonStub<any, any>
//   let createProperties: Sinon.SinonStub<any, any>

//   beforeEach(function () {
//     validateProperties = Sinon.stub(Module, 'validateProperties')
//     createProperties = Sinon.stub(Module, 'createProperties')
//   })

//   afterEach(function () {
//     validateProperties.restore()
//     createProperties.restore()
//   })

//   describe('constructor', function () {
//     it('validates schema and generates parsers', function () {
//       validateProperties.returns([])
//       createProperties.returns({})
//       const schema = { key: { type: 'string' } } as any
//       new Module.Schema(schema)
//       expect(validateProperties).to.have.been.calledWith(schema)
//       expect(createProperties).to.have.been.calledWith(schema)
//     })

//     it('errors if definition fails validation', function () {
//       validateProperties.returns([['fake','prop','sucks']])
//       expect(() => new Module.Schema({})).to.throw(Module.EZNVError)
//     })
//   })

//   describe('load', function () {
//     let loadEnvFile: Sinon.SinonStub<any, any>
//     let findWithSensitivity: Sinon.SinonStub<any, any>
//     let parser: Sinon.SinonStub<any, any>
//     let env = process.env

//     beforeEach(function () {
//       loadEnvFile = Sinon.stub(Module, 'loadEnvFile')
//       findWithSensitivity = Sinon.stub(Module, 'findWithSensitivity')
//       parser = Sinon.stub()
//       process.env = { FAKE: 'value' }
//     })

//     afterEach(function () {
//       loadEnvFile.restore()
//       findWithSensitivity.restore()
//       process.env = env
//     })

//     it('uses options matchCase', async function () {
//       validateProperties.returns([])
//       createProperties.returns({ key: parser })
//       const schema = new Module.Schema({
//         key: { type: 'string', required: false }
//       })

//       const file = { key: 'value' }
//       loadEnvFile.resolves(file)
//       await schema.load({ matchCase: false })
//       expect(findWithSensitivity).to.have.been.calledWith('key', file, 'base')
//       findWithSensitivity.reset()
//       await schema.load({ matchCase: true })
//       expect(findWithSensitivity).to.have.been.calledWith('key', file, 'variant')
//     })

//     it('uses process.env when mode = "default"', async function () {
//       validateProperties.returns([])
//       createProperties.returns({ key: parser })
//       const schema = new Module.Schema({
//         key: { type: 'string', required: false }
//       })

//       const file = {}
//       loadEnvFile.resolves(file)
//       process.env.KEY = 'value'
//       parser.withArgs('value').returns({ errors: [], value: 'value' })
//       findWithSensitivity.withArgs('key', process.env).returns('KEY')
//       findWithSensitivity.withArgs('key', file).returns(undefined)
//       const result = await schema.load({ mode: 'default' })
//       expect(result).to.have.property('key', 'value')
//     })

//     it('uses process.env when mode = "no_file"', async function () {
//       validateProperties.returns([])
//       createProperties.returns({ key: parser })
//       const schema = new Module.Schema({
//         key: { type: 'string', required: false }
//       })

//       const file = {}
//       loadEnvFile.resolves(file)
//       process.env.KEY = 'value'
//       parser.withArgs('value').returns({ errors: [], value: 'value' })
//       findWithSensitivity.withArgs('key', process.env).returns('KEY')
//       findWithSensitivity.withArgs('key', file).returns(undefined)
//       const result = await schema.load({ mode: 'no_file' })
//       expect(result).to.have.property('key', 'value')
//     })

//     it('ignores process.env when mode = "file_only"', async function () {
//       validateProperties.returns([])
//       createProperties.returns({ key: parser })
//       const schema = new Module.Schema({
//         key: { type: 'string', required: false }
//       })

//       const file = {}
//       loadEnvFile.resolves(file)
//       process.env.KEY = 'value'
//       parser.withArgs('value').returns({ errors: [], value: 'value' })
//       findWithSensitivity.withArgs('key', process.env).returns('KEY')
//       findWithSensitivity.withArgs('key', file).returns(undefined)
//       const result = await schema.load({ mode: 'file_only' })
//       expect(result).to.have.property('key', null)
//     })

//     it('uses null when non-required properties are missing', async function () {
//       validateProperties.returns([])
//       createProperties.returns({ key: parser })
//       const schema = new Module.Schema({
//         key: { type: 'string', required: false }
//       })

//       loadEnvFile.resolves({})
//       const result = await schema.load()
//       expect(result).to.have.property('key', null)
//     })

//     it('errors when required properties are missing', async function () {
//       validateProperties.returns([])
//       createProperties.returns({ key: parser })
//       const schema = new Module.Schema({
//         key: { type: 'string' }
//       })

//       loadEnvFile.resolves({})
//       const promise = schema.load()
//       await expect(promise).to.be.rejected
//     })

//     it('uses default when provided and properties are missing', async function () {
//       validateProperties.returns([])
//       createProperties.returns({ key: parser })
//       const schema = new Module.Schema({
//         key: { type: 'string', default: 'value' }
//       })

//       loadEnvFile.resolves({})
//       const result = await schema.load()
//       await expect(result).to.have.property('key', 'value')
//     })

//     it('errors when parsing fails', async function () {
//       validateProperties.returns([])
//       createProperties.returns({ key: parser })
//       const schema = new Module.Schema({
//         key: { type: 'string' }
//       })

//       const file = { key: 'value' }
//       loadEnvFile.resolves(file)
//       findWithSensitivity.withArgs('key', process.env).returns(undefined)
//       findWithSensitivity.withArgs('key', file).returns('key')
//       parser.returns({ errors: ['error'] })
//       loadEnvFile.resolves({ key: 'value' })
//       const promise = schema.load()
//       await expect(promise).to.be.rejected
//     })
//   })
// })

// describe('combineErrors', function () {
//   it ('combines a single error', function () {
//     const message = Module.combineErrors('main', [['name','type','message']])
//     expect(message).to.equal('main\n\ttype property name message')
//   })

//   it ('combines a multiple errors for the same property', function () {
//     const message = Module.combineErrors('main', [
//       ['name','type','message1', 'message2']
//     ])
//     expect(message).to.equal('main\n\ttype property name:\n\tmessage1\n\tmessage2')
//   })

//   it ('combines a multiple errors for different properties', function () {
//     const message = Module.combineErrors('main', [
//       ['name1','type','message'],
//       ['name2','type','message']
//     ])
//     expect(message).to.equal('main\n\ttype property name1 message\n\n\ttype property name2 message')
//   })
// })

// describe('findWithSensitivity', function () {
//   it('finds a string using given sensitivity', function () {
//     let match: string | undefined
//     match = Module.findWithSensitivity('value', { value: null }, 'variant')
//     expect(match).to.equal('value')
//     match = Module.findWithSensitivity('value', { VALUE: null }, 'variant')
//     expect(match).to.be.undefined
//     match = Module.findWithSensitivity('value', { VALUE: null }, 'base')
//     expect(match).to.equal('VALUE')
//   })
// })
