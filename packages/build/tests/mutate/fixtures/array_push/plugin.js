'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    netlifyConfig.functions['*'].included_files.push('two')
  },
}
