'use strict'

const { copyFile } = require('fs')
const { promisify } = require('util')

const pCopyFile = promisify(copyFile)

const fixtureHeadersPath = `${__dirname}/_headers_file`
const headersPath = `${__dirname}/_headers`

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.headers = [...netlifyConfig.headers, { for: '/path', values: { test: 'two' } }]
  },
  async onBuild() {
    await pCopyFile(fixtureHeadersPath, headersPath)
  },
  onPostBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
