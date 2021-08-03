'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.redirects = [{ from: 'api/*', to: '.netlify/functions/:splat', status: 200 }]
  },
}
