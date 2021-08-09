'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.headers = [...netlifyConfig.headers, { for: '/path', values: { test: 'two' } }]
  },
  onPostBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
