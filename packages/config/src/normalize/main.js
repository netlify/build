const deepMerge = require('deepmerge')
const filterObj = require('filter-obj')
const mapObj = require('map-obj')

const { removeFalsy } = require('../utils/remove_falsy')

const { LEGACY_EVENTS, normalizeEventHandler } = require('./events')

// Normalize configuration object
const normalizeConfig = function(config) {
  const { build, plugins, ...configA } = deepMerge(DEFAULT_CONFIG, config)
  const buildA = normalizeBuild(build)
  const pluginsA = plugins.map(normalizePlugin)
  return { ...configA, build: buildA, plugins: pluginsA }
}

const DEFAULT_CONFIG = {
  build: { lifecycle: {}, environment: {} },
  plugins: [],
}

// Normalize `build` property
const normalizeBuild = function({ command, lifecycle, ...build }) {
  const lifecycleA = normalizeOnBuild(command, lifecycle)
  const lifecycleB = mapObj(lifecycleA, normalizeEvent)
  const lifecycleC = filterObj(lifecycleB, hasCommand)
  return { ...build, lifecycle: lifecycleC }
}

// `build.lifecycle.onBuild` was previously called `build.command`
const normalizeOnBuild = function(command, { onBuild = command, ...lifecycle }) {
  if (onBuild === undefined) {
    return lifecycle
  }

  return { ...lifecycle, onBuild }
}

const normalizeEvent = function(event, bashCommand) {
  const eventA = normalizeEventHandler(event)
  const eventB = LEGACY_EVENTS[eventA] === undefined ? eventA : LEGACY_EVENTS[eventA]
  return [eventB, bashCommand]
}

// Remove empty commands
const hasCommand = function(event, bashCommand) {
  return bashCommand.trim() !== ''
}

// `plugins[*].package` was previously called `plugins[*].type`
// Same with `plugins[*].config` renamed to `plugins[*].inputs`
// TODO: remove after the Beta release since it's legacy
const normalizePlugin = function({ type, package = type, config, inputs = config, ...plugin }) {
  return removeFalsy({ ...plugin, package, inputs })
}

module.exports = { normalizeConfig }
