'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')

const pWriteFile = promisify(writeFile)

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.publish = 'test'
  },
  async onBuild({ netlifyConfig: { redirects }, constants: { PUBLISH_DIR } }) {
    console.log(redirects)
    console.log(PUBLISH_DIR)
    await pWriteFile(`${PUBLISH_DIR}/_redirects`, '/from /to')
  },
  onPostBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
