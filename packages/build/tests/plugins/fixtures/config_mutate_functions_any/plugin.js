'use strict'

module.exports = {
  /* eslint-disable no-param-reassign */
  onPreBuild({ netlifyConfig }) {
    netlifyConfig.functions['*'].node_bundler = 'zisi'
    netlifyConfig.functions.test.node_bundler = 'esbuild'
    netlifyConfig.functions.test.external_node_modules = []
    netlifyConfig.functions.test.ignored_node_modules = []
    netlifyConfig.functions.test.included_files = []
  },
  /* eslint-enable no-param-reassign */
}
