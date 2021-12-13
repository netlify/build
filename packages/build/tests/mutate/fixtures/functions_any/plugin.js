'use strict'

module.exports = {
  /* eslint-disable no-param-reassign */
  onPreBuild({ netlifyConfig }) {
    netlifyConfig.functions.node_bundler = 'zisi'
    netlifyConfig.functions.external_node_modules = ['test']
    netlifyConfig.functions.ignored_node_modules = ['test']
    netlifyConfig.functions.included_files = ['test']

    netlifyConfig.functions['*'].node_bundler = 'zisi'
    netlifyConfig.functions['*'].external_node_modules = []
    netlifyConfig.functions['*'].ignored_node_modules = []
    netlifyConfig.functions['*'].included_files = []

    netlifyConfig.functions.test.node_bundler = 'esbuild'
    netlifyConfig.functions.test.external_node_modules = []
    netlifyConfig.functions.test.ignored_node_modules = []
    netlifyConfig.functions.test.included_files = []
  },
  /* eslint-enable no-param-reassign */
}
