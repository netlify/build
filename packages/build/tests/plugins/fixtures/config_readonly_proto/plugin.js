'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    Object.setPrototypeOf(netlifyConfig.build, {})
  },
}
