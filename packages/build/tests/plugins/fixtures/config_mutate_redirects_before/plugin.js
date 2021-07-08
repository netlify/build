'use strict'

const cpFile = require('cp-file')

const fixtureRedirectsPath = `${__dirname}/redirects_file`
const redirectsPath = `${__dirname}/_redirects`

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.redirects = [...netlifyConfig.redirects, { from: '/three', to: '/four' }]
  },
  async onBuild() {
    await cpFile(fixtureRedirectsPath, redirectsPath)
  },
  onPostBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
