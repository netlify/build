'use strict'

const {
  env: { BUILD_ID },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(BUILD_ID)
  },
}
