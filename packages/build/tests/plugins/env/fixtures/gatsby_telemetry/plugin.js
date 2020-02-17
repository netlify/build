const {
  env: { GATSBY_TELEMETRY_DISABLED },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(GATSBY_TELEMETRY_DISABLED)
  },
}
