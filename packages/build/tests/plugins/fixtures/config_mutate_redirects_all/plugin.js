'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.redirects = [...netlifyConfig.redirects, { from: '/three', to: '/four' }]
  },
  onBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
