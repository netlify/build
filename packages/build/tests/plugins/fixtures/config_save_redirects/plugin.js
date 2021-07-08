'use strict'

const cpFile = require('cp-file')

const fixtureRedirectsPath = `${__dirname}/_redirects_file`
const redirectsPath = `${__dirname}/_redirects`

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.redirects = [...netlifyConfig.redirects, { from: '/one', to: '/two' }]
  },
  async onBuild() {
    await cpFile(fixtureRedirectsPath, redirectsPath)
  },
  onSuccess({ netlifyConfig }) {
    console.log(netlifyConfig.redirects)
  },
}
