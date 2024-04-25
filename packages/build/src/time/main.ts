import keepFuncProps from 'keep-func-props'

import { startTimer, endTimer } from './measure.js'

const DEFAULT_METRIC_NAME = 'buildbot.build.stage.duration'
export const TOP_PARENT_TAG = 'run_netlify_build'

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
const kMeasureDuration = function (func, stageTag, { parentTag = undefined, category = undefined } = {}) {
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

// TODO: type properly like this and fix all the upstream type issues
// export const measureDuration: <T extends (...args: any) => any>(
//   fn: T,
//   tag: string,
//   options?: { parentTag?: any; category?: any },
// ) => T = keepFuncProps(kMeasureDuration)
// Ensure the wrapped function `name` is not `anonymous` in stack traces
export const measureDuration = keepFuncProps(kMeasureDuration)

// Create a new object representing a completed timer
export const createTimer = function (
  stageTag,
  durationNs,
  { metricName = DEFAULT_METRIC_NAME, parentTag = TOP_PARENT_TAG, category = undefined, tags = undefined } = {},
) {
  return { metricName, stageTag, parentTag, durationNs, category, tags }
}
