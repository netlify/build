const mapObj = require('map-obj')
const deepMerge = require('deepmerge')

const { removeFalsy } = require('../utils/remove_falsy')

const { LEGACY_EVENTS, normalizeEventHandler } = require('./events')

// Normalize configuration object
const normalizeConfig = function(config) {
  const configA = deepMerge(DEFAULT_CONFIG, config)
  const configB = normalizeLifecycle({ config: configA })
  return configB
}

const DEFAULT_CONFIG = {
  build: { lifecycle: {}, environment: {} },
  plugins: [],
}

const normalizeLifecycle = function({
  config,
  config: {
    build: { command, lifecycle, ...build },
    plugins,
  },
}) {
  const lifecycleA = normalizeOnBuild(lifecycle, command)
  const lifecycleB = mapObj(lifecycleA, normalizeEvent)
  const pluginsA = plugins.map(normalizePlugin)
  return { ...config, build: { ...build, lifecycle: lifecycleB }, plugins: pluginsA }
}

// `build.lifecycle.onBuild` was previously called `build.command`
const normalizeOnBuild = function(lifecycle, command) {
  if (command === undefined) {
    return lifecycle
  }

  return { ...lifecycle, onBuild: command }
}

const normalizeEvent = function(event, bashCommands) {
  const eventA = normalizeEventHandler(event)
  const eventB = LEGACY_EVENTS[eventA] === undefined ? eventA : LEGACY_EVENTS[eventA]
  return [eventB, bashCommands]
}

// `plugins[*].package` was previously called `plugins[*].type`
// Same with `plugins[*].config` renamed to `plugins[*].inputs`
// TODO: remove after the Beta release since it's legacy
const normalizePlugin = function({ type, package = type, config, inputs = config, ...plugin }) {
  return removeFalsy({ ...plugin, package, inputs })
}

module.exports = { normalizeConfig }
