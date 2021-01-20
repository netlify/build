'use strict'

const { mkdir } = require('fs')
const { promisify } = require('util')

const pMkdir = promisify(mkdir)

const DEFAULT_FUNCTIONS_SRC = 'netlify/functions'

module.exports = {
  async onPreBuild() {
    await pMkdir(DEFAULT_FUNCTIONS_SRC, { recursive: true })
  },
}
