import { isNetlifyMaintainedPlugin } from '../plugins/internal.js'

import { createTimer, TOP_PARENT_TAG } from './main.js'
import type { Timer } from './report.js'

// Some timers are computed based on others:
//   - `others` is `total` minus the other timers
//   - `run_plugins` is the sum of all plugins
//   - `run_netlify_build_per_type` aggregates timers but per system/plugin/user
//   - each plugin timer is the sum of its event handlers
export const addAggregatedTimers = function (timers: readonly Timer[]): Timer[] {
  const timersA = addRunPluginsTimer(timers)
  const timersB = addPluginTimers(timersA)
  const timersC = addOthersTimers(timersB)
  const timersD = addTypeTimers(timersC)
  return timersD
}

// Having a `total` timer is redundant since the buildbot already measures this.
// The buildbot measurement is better since it includes the time to load Node.
// Instead, we only use `total` to measure what did not get `measureDuration()`.
const addOthersTimers = function (timers: readonly Timer[]) {
  const totalTimer = timers.find(isTotalTimer)
  const timersA = timers.filter((timer) => !isTotalTimer(timer))
  const topTimers = timersA.filter(isTopTimer)
  const othersTimer = createOthersTimer(topTimers, totalTimer)
  return [...timersA, othersTimer]
}

const isTotalTimer = function ({ stageTag, parentTag }: Timer) {
  return stageTag === 'total' && parentTag === 'build_site'
}

const createOthersTimer = function (topTimers: readonly Timer[], totalTimer: Timer | undefined) {
  // `execBuild()` always measures the `total` timer
  if (totalTimer === undefined) {
    throw new TypeError("Cannot destructure property 'durationNs' of 'undefined' as it is undefined.")
  }

  const { durationNs: totalTimerDurationNs } = totalTimer
  const topTimersDurationNs = computeTimersDuration(topTimers)
  const otherTimersDurationNs = Math.max(0, totalTimerDurationNs - topTimersDurationNs)
  const othersTimer = createAggregatedTimer(OTHERS_STAGE_TAG, otherTimersDurationNs)
  return othersTimer
}

const OTHERS_STAGE_TAG = 'others'

// Measure the total time running plugins
const addRunPluginsTimer = function (timers: readonly Timer[]) {
  const pluginsTimers = timers.filter(isPluginTimer)
  return pluginsTimers.length === 0 ? timers : [...timers, createSumTimer(pluginsTimers, RUN_PLUGINS_STAGE_TAG)]
}

const RUN_PLUGINS_STAGE_TAG = 'run_plugins'

// Retrieve one timer for each plugin, summing all its individual timers
// (one per event handler)
const addPluginTimers = function (timers: readonly Timer[]) {
  const timersA = timers.filter((timer) => !isCommunityPluginTimer(timer))
  const pluginsTimers = timersA.filter(isPluginTimer)
  if (pluginsTimers.length === 0) {
    return timersA
  }

  const pluginPackages = getPluginPackages(pluginsTimers)
  const wholePluginsTimers = pluginPackages.map((pluginPackage) => getWholePluginTimer(pluginPackage, pluginsTimers))
  return [...timersA, ...wholePluginsTimers]
}

// We only measure plugins maintained by us, not community
const isCommunityPluginTimer = function (timer: Timer) {
  return isPluginTimer(timer) && !isNetlifyMaintainedPlugin(getPluginTimerPackage(timer))
}

const getPluginPackages = function (pluginsTimers: readonly Timer[]) {
  const pluginPackages = pluginsTimers.map(getPluginTimerPackage)
  return [...new Set(pluginPackages)]
}

const getWholePluginTimer = function (pluginPackage: string, pluginsTimers: readonly Timer[]) {
  const pluginTimers = pluginsTimers.filter((pluginTimer) => getPluginTimerPackage(pluginTimer) === pluginPackage)
  const wholePluginsTimer = createSumTimer(pluginTimers, pluginPackage, RUN_PLUGINS_STAGE_TAG)
  return wholePluginsTimer
}

const getPluginTimerPackage = function ({ parentTag }: Timer) {
  return parentTag
}

// Check if a timer relates to a Build plugin
const isPluginTimer = function ({ category }: Timer) {
  return category === 'pluginEvent'
}

// Reports total time depending on whether it was system, plugin or user
const addTypeTimers = function (timers: readonly Timer[]) {
  const topTimers = timers.filter(isTopTimer)
  const typeTimers = TYPE_TIMERS.map(({ name, stages }) => getTypeTimer(name, stages, topTimers)).filter(
    (typeTimer) => typeTimer !== undefined,
  )
  return [...timers, ...typeTimers]
}

const TYPE_TIMERS = [
  { name: 'system', stages: ['resolve_config', 'get_plugins_options', 'start_plugins', 'others'] },
  { name: 'plugin', stages: ['load_plugins', 'run_plugins'] },
  { name: 'user', stages: ['build_command', 'edge_functions_bundling', 'functions_bundling', 'deploy_site'] },
]

const getTypeTimer = function (name: string, stages: readonly string[], topTimers: readonly Timer[]) {
  const topTimersA = topTimers.filter(({ stageTag }) => stages.includes(stageTag))

  if (topTimersA.length === 0) {
    return
  }

  const typeTimer = createSumTimer(topTimersA, name, 'run_netlify_build_per_type')
  return typeTimer
}

const isTopTimer = function ({ parentTag }: Timer) {
  return parentTag === TOP_PARENT_TAG
}

// Creates a timer that sums up the duration of several others
const createSumTimer = function (timers: readonly Timer[], stageTag: string, parentTag?: string) {
  const durationNs = computeTimersDuration(timers)
  const timer = createAggregatedTimer(stageTag, durationNs, parentTag)
  return timer
}

const createAggregatedTimer = function (stageTag: string, durationNs: number, parentTag?: string): Timer {
  // `createTimer()` types `tags` as an array, but they are unset here
  return createTimer(stageTag, durationNs, parentTag === undefined ? {} : { parentTag }) as Timer
}

const computeTimersDuration = function (timers: readonly Timer[]) {
  return timers.map(getTimerDuration).reduce(reduceSum, 0)
}

const getTimerDuration = function ({ durationNs }: Timer) {
  return durationNs
}

const reduceSum = function (sum: number, number: number) {
  return sum + number
}
