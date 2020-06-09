const {
  env: { URL, REPOSITORY_URL },
} = require('process')

module.exports = {
  onPreBuild({ constants: { SITE_ID } }) {
    console.log({ SITE_ID, URL, REPOSITORY_URL })
  },
}
