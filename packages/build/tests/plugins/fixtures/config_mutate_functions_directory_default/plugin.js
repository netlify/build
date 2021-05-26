'use strict'

module.exports = {
  onPreBuild({ netlifyConfig, constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functionsDirectory = 'test_functions'
  },
  onBuild({ netlifyConfig, constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
    // eslint-disable-next-line no-param-reassign
    delete netlifyConfig.functionsDirectory
  },
  onPostBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
  },
}
