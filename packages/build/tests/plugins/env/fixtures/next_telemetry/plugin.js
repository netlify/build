const {
  env: { NEXT_TELEMETRY_DISABLED },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(NEXT_TELEMETRY_DISABLED)
  },
}
