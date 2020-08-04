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
// The `durationMs` will be returned by the function. A new `timers` with the
// additional duration timer will be returned as well.
const kMeasureDuration = function(func, tag) {
  return async function({ timers, ...opts }, ...args) {
    const timer = startTimer()
    const { timers: timersA = timers, ...returnObject } = await func({ timers, ...opts }, ...args)
    const durationMs = endTimer(timer)
    const timersB = [...timersA, { tag, durationMs }]
    return { ...returnObject, timers: timersB, durationMs }
  }
}

// Ensure the wrapped function `name` is not `anonymous` in stack traces
const measureDuration = keepFuncProps(kMeasureDuration)

// Make sure the timer name does not include special characters.
// For example, the `package` of local plugins includes dots.
const normalizeTimerName = function(name) {
  return slugify(name, { separator: '_' })
}

module.exports = { initTimers, measureDuration, normalizeTimerName }
