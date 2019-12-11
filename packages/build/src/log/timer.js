const { hrtime } = require('process')

const { logTimer } = require('./main')

// Starts a timer
const startTimer = function() {
  return hrtime()
}

// Stops a timer
const endTimerDuration = function([startSecs, startNsecs]) {
  const [endSecs, endNsecs] = hrtime()
  const durationNs = (endSecs - startSecs) * NANOSECS_TO_SECS + endNsecs - startNsecs
  const durationMs = Math.ceil(durationNs / NANOSECS_TO_MSECS)
  return durationMs
}

// Ends a timer and prints the result on console
const endTimer = function(hrTime, id, event) {
  const durationMs = endTimerDuration(hrTime)

  logTimer(durationMs, event, id)

  return durationMs
}

const NANOSECS_TO_SECS = 1e9
const NANOSECS_TO_MSECS = 1e6

module.exports = { startTimer, endTimer }
