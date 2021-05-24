'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    Object.preventExtensions(netlifyConfig.build)
  },
}
