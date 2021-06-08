'use strict'

module.exports = {
  /* eslint-disable no-param-reassign */
  // eslint-disable-next-line max-statements
  onPreBuild({ netlifyConfig }) {
    netlifyConfig.functions.node_bundler = 'zisi'
    console.log(netlifyConfig.functions['*'].node_bundler)
    netlifyConfig.functions.external_node_modules = ['test']
    console.log(netlifyConfig.functions['*'].external_node_modules)
    netlifyConfig.functions.ignored_node_modules = ['test']
    console.log(netlifyConfig.functions['*'].ignored_node_modules)
    netlifyConfig.functions.included_files = ['test']
    console.log(netlifyConfig.functions['*'].included_files)

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
