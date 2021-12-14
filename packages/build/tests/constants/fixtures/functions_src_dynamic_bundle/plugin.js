'use strict'

const { mkdir } = require('fs')
const { dirname } = require('path')
const { promisify } = require('util')

const pMkdir = promisify(mkdir)

const DEFAULT_FUNCTIONS_SRC = 'netlify/functions'

module.exports = {
  async onPreBuild() {
    await pMkdir(dirname(DEFAULT_FUNCTIONS_SRC))
    await pMkdir(DEFAULT_FUNCTIONS_SRC)
  },
}
