'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.test = {}
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.test.included_files = []
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.test = { included_files: [] }
  },
}
