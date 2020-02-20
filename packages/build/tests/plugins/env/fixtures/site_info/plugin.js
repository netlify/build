const {
  env: { URL, REPOSITORY_URL },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit({ constants: { SITE_ID } }) {
    console.log(JSON.stringify({ SITE_ID, URL, REPOSITORY_URL }, null, 2))
  },
}
