'use strict'

module.exports = {
  onPreBuild({ netlifyConfig: { redirects, build } }) {
    console.log(redirects)
    // eslint-disable-next-line no-param-reassign
    build.publish = 'test'
  },
  onBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
