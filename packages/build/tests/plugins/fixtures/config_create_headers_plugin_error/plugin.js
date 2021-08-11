'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    netlifyConfig.headers.push({ values: {} })
  },
  onBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
