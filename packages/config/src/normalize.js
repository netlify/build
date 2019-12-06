const mapObj = require('map-obj')
const deepMerge = require('deepmerge')

const { LEGACY_LIFECYCLE } = require('./lifecycle.js')

// Normalize configuration object
const normalizeConfig = function(config) {
  const configA = deepMerge(DEFAULT_CONFIG, config)
  const configB = normalizeLifecycles({ config: configA })
  return configB
}

const DEFAULT_CONFIG = { build: { lifecycle: {} }, plugins: [] }

const normalizeLifecycles = function({
  config,
  config: {
    build: { command, lifecycle, ...build },
  },
}) {
  const lifecycleA = normalizeCommand(lifecycle, command)

  const lifecycleB = mapObj(lifecycleA, normalizeLifecycle)

  return { ...config, build: { ...build, lifecycle: lifecycleB } }
}

// `build.lifecycle.onBuild` was previously called `build.command`
const normalizeCommand = function(lifecycle, command) {
  if (command === undefined) {
    return lifecycle
  }

  return { ...lifecycle, onBuild: command }
}

const normalizeLifecycle = function(hook, value) {
  const hookA = LEGACY_LIFECYCLE[hook] === undefined ? hook : LEGACY_LIFECYCLE[hook]
  const valueA = typeof value === 'string' ? value.trim().split('\n') : value
  return [hookA, valueA]
}

module.exports = { normalizeConfig }
