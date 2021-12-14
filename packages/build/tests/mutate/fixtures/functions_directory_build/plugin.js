'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.functions = 'test_functions'
  },
  onBuild({ netlifyConfig }) {
    console.log(netlifyConfig.functionsDirectory)
  },
}
