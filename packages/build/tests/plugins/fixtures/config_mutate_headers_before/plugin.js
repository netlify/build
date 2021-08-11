'use strict'

const cpFile = require('cp-file')

const fixtureHeadersPath = `${__dirname}/headers_file`
const headersPath = `${__dirname}/_headers`

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.headers = [...netlifyConfig.headers, { for: '/path', values: { test: 'two' } }]
  },
  async onBuild() {
    await cpFile(fixtureHeadersPath, headersPath)
  },
  onPostBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
