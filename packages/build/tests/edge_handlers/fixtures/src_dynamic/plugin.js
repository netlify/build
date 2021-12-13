'use strict'

const { mkdir, rmdir } = require('fs')
const { dirname } = require('path')
const { promisify } = require('util')

const pMkdir = promisify(mkdir)
const pRmdir = promisify(rmdir)

const DEFAULT_EDGE_HANDLERS_SRC = 'netlify/edge-handlers'

module.exports = {
  async onPreBuild({ constants: { EDGE_HANDLERS_SRC } }) {
    console.log(EDGE_HANDLERS_SRC === undefined)
    await pMkdir(dirname(DEFAULT_EDGE_HANDLERS_SRC))
    await pMkdir(DEFAULT_EDGE_HANDLERS_SRC)
  },
  async onBuild({ constants: { EDGE_HANDLERS_SRC } }) {
    console.log(EDGE_HANDLERS_SRC)
    await pRmdir(DEFAULT_EDGE_HANDLERS_SRC)
  },
  onPostBuild({ constants: { EDGE_HANDLERS_SRC } }) {
    console.log(EDGE_HANDLERS_SRC === undefined)
  },
}
