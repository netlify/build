'use strict'

const { red } = require('chalk')

module.exports = {
  onPreBuild() {
    throw new Error(red('ColorTest'))
  },
}
