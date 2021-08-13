'use strict'

const { copyFile } = require('fs')
const { promisify } = require('util')

const fixtureRedirectsPath = `${__dirname}/redirects_file`
const redirectsPath = `${__dirname}/_redirects`

const pCopyFile = promisify(copyFile)

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.redirects = [...netlifyConfig.redirects, { from: '/three', to: '/four' }]
  },
  async onBuild() {
    await pCopyFile(fixtureRedirectsPath, redirectsPath)
  },
  onPostBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
