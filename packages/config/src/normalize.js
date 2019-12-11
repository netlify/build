const mapObj = require('map-obj')
const deepMerge = require('deepmerge')

const { LEGACY_LIFECYCLE, normalizeLifecycleCase } = require('./events')

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
  },
}) {
  const lifecycleA = normalizeOnBuild(lifecycle, command)
  const lifecycleB = mapObj(lifecycleA, normalizeBashCommands)
  return { ...config, build: { ...build, lifecycle: lifecycleB } }
}

// `build.lifecycle.onBuild` was previously called `build.command`
const normalizeOnBuild = function(lifecycle, command) {
  if (command === undefined) {
    return lifecycle
  }

  return { ...lifecycle, onBuild: command }
}

const normalizeBashCommands = function(event, bashCommands) {
  const eventA = normalizeLifecycleCase(event)
  const eventB = LEGACY_LIFECYCLE[eventA] === undefined ? eventA : LEGACY_LIFECYCLE[eventA]
  const bashCommandsA = typeof bashCommands === 'string' ? bashCommands.trim().split('\n') : bashCommands
  return [eventB, bashCommandsA]
}

module.exports = { normalizeConfig }
