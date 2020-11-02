'use strict'

const {
  env: { NEXT_TELEMETRY_DISABLED },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(NEXT_TELEMETRY_DISABLED)
  },
}
