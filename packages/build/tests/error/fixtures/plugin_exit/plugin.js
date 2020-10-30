'use strict'

const { exit } = require('process')

module.exports = {
  onPreBuild() {
    exit(1)
  },
  onBuild() {
    console.log('test')
  },
}
