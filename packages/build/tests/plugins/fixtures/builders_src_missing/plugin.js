'use strict'

const pathExists = require('path-exists')

module.exports = {
  async onPreBuild({ constants: { BUILDERS_SRC } }) {
    console.log(BUILDERS_SRC, await pathExists(BUILDERS_SRC))
  },
}
