'use strict'

const { mkdir, rmdir } = require('fs')
const { promisify } = require('util')

const pMkdir = promisify(mkdir)
const pRmdir = promisify(rmdir)

const DEFAULT_FUNCTIONS_SRC = 'netlify/functions'

module.exports = {
  async onPreBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC === undefined)
    await pMkdir(DEFAULT_FUNCTIONS_SRC, { recursive: true })
  },
  async onBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
    await pRmdir(DEFAULT_FUNCTIONS_SRC)
  },
  onPostBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC === undefined)
  },
}
