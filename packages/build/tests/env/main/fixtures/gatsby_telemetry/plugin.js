const {
  env: { GATSBY_TELEMETRY_DISABLED },
} = require('process')

module.exports = {
  onInit() {
    console.log(GATSBY_TELEMETRY_DISABLED)
  },
}
