const mapObj = require('map-obj')
const filterObj = require('filter-obj')
const deepMerge = require('deepmerge')

const { LEGACY_EVENTS, normalizeEventHandler } = require('./events')

// Normalize configuration object
const normalizeConfig = function(config) {
  const configA = deepMerge(DEFAULT_CONFIG, config)
  const configB = normalizeLifecycle({ config: configA })
  return configB
}

const DEFAULT_CONFIG = { build: { lifecycle: {} }, plugins: [] }

const normalizeLifecycle = function({
  config,
  config: {
    build: { command, lifecycle, ...build },
    plugins,
  },
}) {
  const lifecycleA = normalizeOnBuild(lifecycle, command)
  const lifecycleB = mapObj(lifecycleA, normalizeBashCommands)
  const lifecycleC = filterObj(lifecycleB, hasCommands)
  const pluginsA = plugins.map(normalizePlugin)
  return { ...config, build: { ...build, lifecycle: lifecycleC }, plugins: pluginsA }
}

// `build.lifecycle.onBuild` was previously called `build.command`
const normalizeOnBuild = function(lifecycle, command) {
  if (command === undefined) {
    return lifecycle
  }

  return { ...lifecycle, onBuild: command }
}

const normalizeBashCommands = function(event, bashCommands) {
  const eventA = normalizeEventHandler(event)
  const eventB = LEGACY_EVENTS[eventA] === undefined ? eventA : LEGACY_EVENTS[eventA]
  const bashCommandsA = typeof bashCommands === 'string' ? bashCommands.trim().split('\n') : bashCommands
  // Remove commands that are empty strings
  const bashCommandsB = bashCommandsA.filter(Boolean)
  return [eventB, bashCommandsB]
}

// Remove commands that are empty arrays
const hasCommands = function(event, bashCommands) {
  return bashCommands.length !== 0
}

// `plugins[*].package` was previously called `plugins[*].type`
// TODO: remove after the Beta release since it's legacy
const normalizePlugin = function({ type, package = type, ...plugin }) {
  return { ...plugin, package }
}

module.exports = { normalizeConfig }
