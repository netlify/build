'use strict'

module.exports = {
  onPreBuild({ netlifyConfig: { build } }) {
    // eslint-disable-next-line no-param-reassign
    delete build.command
  },
}
