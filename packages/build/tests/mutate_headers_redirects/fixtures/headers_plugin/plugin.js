'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')

const pWriteFile = promisify(writeFile)

module.exports = {
  async onPreBuild({ netlifyConfig: { headers }, constants: { PUBLISH_DIR } }) {
    console.log(headers)
    await pWriteFile(`${PUBLISH_DIR}/_headers`, '/path\n  test: one')
  },
  onBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
