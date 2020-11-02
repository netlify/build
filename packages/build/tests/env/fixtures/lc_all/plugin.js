'use strict'

const {
  env: { LC_ALL },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(LC_ALL)
  },
}
