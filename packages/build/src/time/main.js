const slugify = require('@sindresorhus/slugify')
const keepFuncProps = require('keep-func-props')

const { startTimer, endTimer } = require('./measure')

// Initialize the `timers` array
const initTimers = function() {
  return []
}

// Wrap an async function to measure how long it takes.
// The function must:
//   - take a plain object as first argument. This must contain a `timers`.
//   - return a plain object. This may or may not contain a modified `timers`.
// The `durationNs` will be returned by the function. A new `timers` with the
// additional duration timer will be returned as well.
const kMeasureDuration = function(func, stageTag, { parentTag, category } = {}) {
  return async function({ timers, ...opts }, ...args) {
    const timerNs = startTimer()
    const { timers: timersA = timers, ...returnObject } = await func({ timers, ...opts }, ...args)
    const durationNs = endTimer(timerNs)
    const timer = createTimer(stageTag, durationNs, { parentTag, category })
    const timersB = [...timersA, timer]
    return { ...returnObject, timers: timersB, durationNs }
  }
}

// Ensure the wrapped function `name` is not `anonymous` in stack traces
const measureDuration = keepFuncProps(kMeasureDuration)

// Create a new object representing a completed timer
const createTimer = function(
  stageTag,
  durationNs,
  { metricName = DEFAULT_METRIC_NAME, parentTag = TOP_PARENT_TAG, category } = {},
) {
  return { metricName, stageTag, parentTag, durationNs, category }
}

const DEFAULT_METRIC_NAME = 'buildbot.build.stage.duration'
const TOP_PARENT_TAG = 'run_netlify_build'

// Make sure the timer name does not include special characters.
// For example, the `package` of local plugins includes dots.
const normalizeTimerName = function(name) {
  return slugify(name, { separator: '_' })
}

module.exports = { initTimers, measureDuration, normalizeTimerName, createTimer, TOP_PARENT_TAG }
