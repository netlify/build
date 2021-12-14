'use strict'

module.exports = {
  onPreBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
  onBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
