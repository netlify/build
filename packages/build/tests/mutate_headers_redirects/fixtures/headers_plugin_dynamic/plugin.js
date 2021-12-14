'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')

const pWriteFile = promisify(writeFile)

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.publish = 'test'
  },
  async onBuild({ netlifyConfig: { headers }, constants: { PUBLISH_DIR } }) {
    console.log(headers)
    console.log(PUBLISH_DIR)
    await pWriteFile(`${PUBLISH_DIR}/_headers`, '/path\n  test: one')
  },
  onPostBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
