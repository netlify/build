'use strict'

const { mkdir } = require('fs')
const { dirname } = require('path')
const { promisify } = require('util')

const pMkdir = promisify(mkdir)

const DEFAULT_BUILDERS_SRC = 'netlify/builders'

module.exports = {
  async onPreBuild({ constants: { BUILDERS_SRC } }) {
    console.log(BUILDERS_SRC.endsWith('test'))
    await pMkdir(dirname(DEFAULT_BUILDERS_SRC))
    await pMkdir(DEFAULT_BUILDERS_SRC)
  },
  onBuild({ constants: { BUILDERS_SRC } }) {
    console.log(BUILDERS_SRC.endsWith('test'))
  },
}
