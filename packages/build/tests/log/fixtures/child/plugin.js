'use strict'

const { red } = require('chalk')

module.exports = {
  onPreBuild() {
    console.log(red('onPreBuild'))
  },
}
