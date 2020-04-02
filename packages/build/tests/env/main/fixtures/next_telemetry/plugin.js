const {
  env: { NEXT_TELEMETRY_DISABLED },
} = require('process')

module.exports = {
  onInit() {
    console.log(NEXT_TELEMETRY_DISABLED)
  },
}
