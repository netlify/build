'use strict'

const { resolve } = require('path')

module.exports = {
  onPreBuild({ constants: { PUBLISH_DIR } }) {
    console.log(PUBLISH_DIR, resolve(PUBLISH_DIR) === resolve(__dirname))
  },
}
