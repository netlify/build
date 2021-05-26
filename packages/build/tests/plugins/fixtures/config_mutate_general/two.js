'use strict'

module.exports = {
  onBuild({ netlifyConfig }) {
    console.log(netlifyConfig.functionsDirectory)
  },
}
