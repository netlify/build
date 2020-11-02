'use strict'

const { env } = require('process')

module.exports = {
  onPreBuild() {
    env.TEST_ONE = 'one'
    env.TEST_TWO = 'two'
    delete env.LANGUAGE
  },
}
