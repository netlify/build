'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')

const pWriteFile = promisify(writeFile)

module.exports = {
  async onPreBuild({ netlifyConfig: { redirects }, constants: { PUBLISH_DIR } }) {
    console.log(redirects)
    await pWriteFile(`${PUBLISH_DIR}/_redirects`, '/from /to')
  },
  onBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
