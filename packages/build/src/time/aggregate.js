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
const isPluginTimer = function({ tag }) {
  return !tag.startsWith(NON_PLUGIN_PREFIX)
}

const NON_PLUGIN_PREFIX = 'run_netlify_build.'
const RUN_PLUGINS_TAG = `${NON_PLUGIN_PREFIX}run_plugins`

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
  const wholePluginsTimer = createSumTimer(pluginTimers, pluginPackage)
  return wholePluginsTimer
}

const getPluginTimerPackage = function({ tag }) {
  const [pluginPackage] = tag.split('.')
  return pluginPackage
}

// Creates a timer that sums up the duration of several others
const createSumTimer = function(timers, tag) {
  const durationMs = computeTimersDuration(timers)
  return { tag, durationMs }
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
