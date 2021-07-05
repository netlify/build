'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.directory = 'test_functions'
  },
  onBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC)
  },
}
