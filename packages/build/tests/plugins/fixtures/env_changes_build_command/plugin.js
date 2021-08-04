'use strict'

module.exports = {
  onPreBuild({
    netlifyConfig: {
      build: { environment },
    },
  }) {
    // eslint-disable-next-line no-param-reassign
    environment.TEST_ONE = 'one'
    // eslint-disable-next-line no-param-reassign
    environment.TEST_TWO = 'two'
    // eslint-disable-next-line no-param-reassign
    environment.LANGUAGE = ''
  },
}
