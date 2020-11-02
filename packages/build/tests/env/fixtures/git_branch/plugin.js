'use strict'

const {
  env: { BRANCH, HEAD },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(BRANCH, HEAD)
  },
}
