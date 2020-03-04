const {
  env: { NETLIFY_BUILD_DEBUG_PROCESS_ERRORS },
} = require('process')

const logProcessErrors = require('log-process-errors')

const { hasColors } = require('../log/colors')

// Print stack traces of warnings.
// This is for debugging purpose only, so behind an environment variable.
if (NETLIFY_BUILD_DEBUG_PROCESS_ERRORS === '1') {
  logProcessErrors({ colors: hasColors() })
}
