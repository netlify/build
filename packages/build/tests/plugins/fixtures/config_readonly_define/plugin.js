'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    Object.defineProperty(netlifyConfig.build, 'ignore', { value: '' })
  },
}
