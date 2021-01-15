'use strict'

const { env } = require('process')

module.exports = {
  onPreBuild() {
    console.log(env.TEST_ONE, env.TEST_TWO)
  },
  onBuild() {
    console.log(env.TEST_ONE, env.TEST_TWO)

    delete env.TEST_ONE
    env.TEST_TWO = 'twoChanged'
  },
}
