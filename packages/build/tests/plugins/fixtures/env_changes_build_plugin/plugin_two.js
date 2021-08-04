'use strict'

const { env } = require('process')

module.exports = {
  onPreBuild() {
    console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
  },
  onBuild({
    netlifyConfig: {
      build: { environment },
    },
  }) {
    console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)

    // eslint-disable-next-line no-param-reassign
    environment.TEST_ONE = ''
    // eslint-disable-next-line no-param-reassign
    environment.TEST_TWO = 'twoChanged'
  },
}
