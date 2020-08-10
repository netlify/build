const { createTimer } = require('./main')

// Some timers are computed based on others:
//   - `run_plugins` is the sum of all plugins
//   - each plugin timer is the sum of its event handlers
const addAggregatedTimers = function(timers) {
  const pluginsTimers = timers.filter(isPluginTimer)
  if (pluginsTimers.length === 0) {
    return timers
  }

  const runPluginsTimer = createSumTimer(pluginsTimers, RUN_PLUGINS_TAG)
  const wholePluginsTimers = getWholePluginsTimers(pluginsTimers)
  return [...timers, runPluginsTimer, ...wholePluginsTimers]
}

// Check if a timer relates to a Build plugin
const isPluginTimer = function({ category }) {
  return category === 'pluginEvent'
}

const RUN_PLUGINS_TAG = 'run_plugins'

// Retrieve one timer for each plugin, summing all its individual timers
// (one per event handler)
const getWholePluginsTimers = function(pluginsTimers) {
  const pluginPackages = getPluginPackages(pluginsTimers)
  return pluginPackages.map(pluginPackage => getWholePluginTimer(pluginPackage, pluginsTimers))
}

const getPluginPackages = function(pluginsTimers) {
  const pluginPackages = pluginsTimers.map(getPluginTimerPackage)
  return [...new Set(pluginPackages)]
}

const getWholePluginTimer = function(pluginPackage, pluginsTimers) {
  const pluginTimers = pluginsTimers.filter(pluginTimer => getPluginTimerPackage(pluginTimer) === pluginPackage)
  const wholePluginsTimer = createSumTimer(pluginTimers, pluginPackage, RUN_PLUGINS_TAG)
  return wholePluginsTimer
}

const getPluginTimerPackage = function({ parentTag }) {
  return parentTag
}

// Creates a timer that sums up the duration of several others
const createSumTimer = function(timers, stageTag, parentTag) {
  const durationMs = computeTimersDuration(timers)
  const timer = createTimer(stageTag, durationMs, { parentTag })
  return timer
}

const computeTimersDuration = function(timers) {
  return timers.map(getTimerDuration).reduce(reduceSum, 0)
}

const getTimerDuration = function({ durationMs }) {
  return durationMs
}

const reduceSum = function(sum, number) {
  return sum + number
}

module.exports = { addAggregatedTimers }
