'use strict'

const {
  env: { BRANCH },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(BRANCH)
  },
}
