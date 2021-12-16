import slugify from '@sindresorhus/slugify'
import keepFuncProps from 'keep-func-props'

import { startTimer, endTimer } from './measure.js'

// Initialize the `timers` array
export const initTimers = function () {
  return []
}

// Wrap an async function to measure how long it takes.
// The function must:
//   - take a plain object as first argument. This must contain a `timers`.
//   - return a plain object. This may or may not contain a modified `timers`.
// The `durationNs` will be returned by the function. A new `timers` with the
// additional duration timer will be returned as well.
const kMeasureDuration = function (func, stageTag, { parentTag, category } = {}) {
  return async function measuredFunc({ timers, ...opts }, ...args) {
    const timerNs = startTimer()
    const { timers: timersA = timers, ...returnObject } = await func({ timers, ...opts }, ...args)
    const { tags = {} } = returnObject
    const durationNs = endTimer(timerNs)
    const timer = createTimer(stageTag, durationNs, { parentTag, category, tags })
    const timersB = [...timersA, timer]
    return { ...returnObject, timers: timersB, durationNs }
  }
}

// Ensure the wrapped function `name` is not `anonymous` in stack traces
export const measureDuration = keepFuncProps(kMeasureDuration)

// Create a new object representing a completed timer
export const createTimer = function (
  stageTag,
  durationNs,
  { metricName = DEFAULT_METRIC_NAME, parentTag = TOP_PARENT_TAG, category, tags } = {},
) {
  return { metricName, stageTag, parentTag, durationNs, category, tags }
}

const DEFAULT_METRIC_NAME = 'buildbot.build.stage.duration'
export const TOP_PARENT_TAG = 'run_netlify_build'

// Make sure the timer name does not include special characters.
// For example, the `packageName` of local plugins includes dots.
export const normalizeTimerName = function (name) {
  return slugify(name, { separator: '_' })
}
