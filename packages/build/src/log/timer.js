const { hrtime } = require('process')

// Starts a timer
const startTimer = function() {
  return hrtime()
}

// Stops a timer
const endTimer = function([startSecs, startNsecs]) {
  const [endSecs, endNsecs] = hrtime()
  const durationNs = (endSecs - startSecs) * NANOSECS_TO_SECS + endNsecs - startNsecs
  const durationMs = Math.ceil(durationNs / NANOSECS_TO_MSECS)
  return durationMs
}

const NANOSECS_TO_SECS = 1e9
const NANOSECS_TO_MSECS = 1e6

module.exports = { startTimer, endTimer }
