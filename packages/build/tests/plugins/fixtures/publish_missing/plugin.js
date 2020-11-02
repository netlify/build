'use strict'

const pathExists = require('path-exists')

module.exports = {
  async onPreBuild({ constants: { PUBLISH_DIR } }) {
    console.log(PUBLISH_DIR, await pathExists(PUBLISH_DIR))
  },
}
