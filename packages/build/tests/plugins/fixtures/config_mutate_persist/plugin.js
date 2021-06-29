'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.command = 'node --version'
  },
  onBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.external_node_modules = 'test'
  },
  onPostBuild({ netlifyConfig }) {
    console.log(netlifyConfig.build.command)
    console.log(netlifyConfig.functions.external_node_modules)
  },
}
