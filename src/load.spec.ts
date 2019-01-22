/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

import * as path from 'path'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as Envio from '.'

chai.use(sinonChai)
chai.use(chaiAsPromised)

const expect = chai.expect

describe('load()', function () {
  it('is a function', function () {
    expect(Envio.load).to.be.a('function')
  })
})
