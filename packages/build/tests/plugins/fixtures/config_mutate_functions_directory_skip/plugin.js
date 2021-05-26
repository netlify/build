'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    console.log(netlifyConfig.functionsDirectory)
    // eslint-disable-next-line no-param-reassign
    delete netlifyConfig.functionsDirectory
  },
}
