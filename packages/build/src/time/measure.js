import { hrtime } from 'process'

// Starts a timer
export const startTimer = function () {
  return hrtime()
}

// Stops a timer
export const endTimer = function ([startSecs, startNsecs]) {
  const [endSecs, endNsecs] = hrtime()
  const durationNs = (endSecs - startSecs) * NANOSECS_TO_SECS + endNsecs - startNsecs
  return durationNs
}

// statsd expects milliseconds integers.
// To prevent double rounding errors, rounding should only be applied once.
export const roundTimerToMillisecs = function (durationNs) {
  return Math.round(durationNs / NANOSECS_TO_MSECS)
}

const NANOSECS_TO_SECS = 1e9
const NANOSECS_TO_MSECS = 1e6
