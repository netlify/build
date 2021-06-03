'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.test = {}
    console.log(netlifyConfig.functions)

    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.test.included_files = []
    console.log(netlifyConfig.functions)

    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.test = { included_files: [] }
    console.log(netlifyConfig.functions)

    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.test.included_files[0] = 'test'
    console.log(netlifyConfig.functions)
  },
}
