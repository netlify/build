const {
  env: { GATSBY_TELEMETRY_DISABLED },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(GATSBY_TELEMETRY_DISABLED)
  },
}
