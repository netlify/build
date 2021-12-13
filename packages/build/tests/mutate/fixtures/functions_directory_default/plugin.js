'use strict'

module.exports = {
  onPreBuild({ netlifyConfig, constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.directory = 'test_functions'
  },
  onBuild({ netlifyConfig, constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.directory = ''
  },
  onPostBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
  },
}
