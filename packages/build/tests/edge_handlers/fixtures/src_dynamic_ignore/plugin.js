'use strict'

const { mkdir } = require('fs')
const { dirname } = require('path')
const { promisify } = require('util')

const pMkdir = promisify(mkdir)

const DEFAULT_EDGE_HANDLERS_SRC = 'netlify/edge-handlers'

module.exports = {
  async onPreBuild({ constants: { EDGE_HANDLERS_SRC } }) {
    console.log(EDGE_HANDLERS_SRC.endsWith('test'))
    await pMkdir(dirname(DEFAULT_EDGE_HANDLERS_SRC))
    await pMkdir(DEFAULT_EDGE_HANDLERS_SRC)
  },
  onBuild({ constants: { EDGE_HANDLERS_SRC } }) {
    console.log(EDGE_HANDLERS_SRC.endsWith('test'))
  },
}
