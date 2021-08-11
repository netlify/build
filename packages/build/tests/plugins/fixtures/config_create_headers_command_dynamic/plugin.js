'use strict'

module.exports = {
  onPreBuild({ netlifyConfig: { headers, build } }) {
    console.log(headers)
    // eslint-disable-next-line no-param-reassign
    build.publish = 'test'
  },
  onBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
