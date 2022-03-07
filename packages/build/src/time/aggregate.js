import { createTimer, TOP_PARENT_TAG } from './main.js'

// Some timers are computed based on others:
//   - `others` is `total` minus the other timers
//   - `run_plugins` is the sum of all plugins
//   - `run_netlify_build_per_type` aggregates timers but per system/plugin/user
//   - each plugin timer is the sum of its event handlers
export const addAggregatedTimers = function (timers) {
  const timersA = addRunPluginsTimer(timers)
  const timersB = addPluginTimers(timersA)
  const timersC = addOthersTimers(timersB)
  const timersD = addTypeTimers(timersC)
  return timersD
}

// Having a `total` timer is redundant since the buildbot already measures this.
// The buildbot measurement is better since it includes the time to load Node.
// Instead, we only use `total` to measure what did not get `measureDuration()`.
const addOthersTimers = function (timers) {
  const totalTimer = timers.find(isTotalTimer)
  const timersA = timers.filter((timer) => !isTotalTimer(timer))
  const topTimers = timersA.filter(isTopTimer)
  const othersTimer = createOthersTimer(topTimers, totalTimer)
  return [...timersA, othersTimer]
}

const isTotalTimer = function ({ stageTag, parentTag }) {
  return stageTag === 'total' && parentTag === 'build_site'
}

const createOthersTimer = function (topTimers, { durationNs: totalTimerDurationNs }) {
  const topTimersDurationNs = computeTimersDuration(topTimers)
  const otherTimersDurationNs = Math.max(0, totalTimerDurationNs - topTimersDurationNs)
  const othersTimer = createTimer(OTHERS_STAGE_TAG, otherTimersDurationNs)
  return othersTimer
}

const OTHERS_STAGE_TAG = 'others'

// Measure the total time running plugins
const addRunPluginsTimer = function (timers) {
  const pluginsTimers = timers.filter(isPluginTimer)
  return pluginsTimers.length === 0 ? timers : [...timers, createSumTimer(pluginsTimers, RUN_PLUGINS_STAGE_TAG)]
}

const RUN_PLUGINS_STAGE_TAG = 'run_plugins'

// Retrieve one timer for each plugin, summing all its individual timers
// (one per event handler)
const addPluginTimers = function (timers) {
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
const isCommunityPluginTimer = function (timer) {
  return isPluginTimer(timer) && !isNetlifyMaintainedPlugin(getPluginTimerPackage(timer))
}

const isNetlifyMaintainedPlugin = function (pluginPackage) {
  return NETLIFY_MAINTAINED_PLUGINS.has(pluginPackage)
}

const NETLIFY_MAINTAINED_PLUGINS = new Set([
  'netlify_plugin_gatsby_cache',
  'netlify_plugin_sitemap',
  'netlify_plugin_debug_cache',
  'netlify_plugin_is_website_vulnerable',
  'netlify_plugin_lighthouse',
  'netlify_plugin_nextjs',
  'netlify_plugin_gatsby',
])

const getPluginPackages = function (pluginsTimers) {
  const pluginPackages = pluginsTimers.map(getPluginTimerPackage)
  return [...new Set(pluginPackages)]
}

const getWholePluginTimer = function (pluginPackage, pluginsTimers) {
  const pluginTimers = pluginsTimers.filter((pluginTimer) => getPluginTimerPackage(pluginTimer) === pluginPackage)
  const wholePluginsTimer = createSumTimer(pluginTimers, pluginPackage, RUN_PLUGINS_STAGE_TAG)
  return wholePluginsTimer
}

const getPluginTimerPackage = function ({ parentTag }) {
  return parentTag
}

// Check if a timer relates to a Build plugin
const isPluginTimer = function ({ category }) {
  return category === 'pluginEvent'
}

// Reports total time depending on whether it was system, plugin or user
const addTypeTimers = function (timers) {
  const topTimers = timers.filter(isTopTimer)
  const typeTimers = TYPE_TIMERS.map(({ name, stages }) => getTypeTimer(name, stages, topTimers)).filter(Boolean)
  return [...timers, ...typeTimers]
}

const TYPE_TIMERS = [
  { name: 'system', stages: ['resolve_config', 'get_plugins_options', 'start_plugins', 'others'] },
  { name: 'plugin', stages: ['load_plugins', 'run_plugins'] },
  { name: 'user', stages: ['build_command', 'functions_bundling', 'deploy_site'] },
]

const getTypeTimer = function (name, stages, topTimers) {
  const topTimersA = topTimers.filter(({ stageTag }) => stages.includes(stageTag))

  if (topTimersA.length === 0) {
    return
  }

  const typeTimer = createSumTimer(topTimersA, name, 'run_netlify_build_per_type')
  return typeTimer
}

const isTopTimer = function ({ parentTag }) {
  return parentTag === TOP_PARENT_TAG
}

// Creates a timer that sums up the duration of several others
const createSumTimer = function (timers, stageTag, parentTag) {
  const durationNs = computeTimersDuration(timers)
  const timer = createTimer(stageTag, durationNs, { parentTag })
  return timer
}

const computeTimersDuration = function (timers) {
  return timers.map(getTimerDuration).reduce(reduceSum, 0)
}

const getTimerDuration = function ({ durationNs }) {
  return durationNs
}

const reduceSum = function (sum, number) {
  return sum + number
}
