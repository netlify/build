const mapObj = require('map-obj')

// Normalize configuration object
const normalizeConfig = function(config) {
  const configA = { ...DEFAULT_CONFIG, ...config }
  const configB = normalizeLifecycles({ config: configA })
  return configB
}

const DEFAULT_CONFIG = { build: {}, plugins: [] }

const normalizeLifecycles = function({
  config,
  config: {
    build: { command, lifecycle = {}, ...build },
  },
}) {
  const lifecycleA = normalizeCommand(lifecycle, command)

  const lifecycleB = mapObj(lifecycleA, normalizeLifecycle)

  return { ...config, build: { ...build, lifecycle: lifecycleB } }
}

// `build.lifecycle.build` was previously called `build.command`
const normalizeCommand = function(lifecycle, command) {
  if (command === undefined) {
    return lifecycle
  }

  return { ...lifecycle, build: command }
}

const normalizeLifecycle = function(hook, value) {
  const hookA = hook.replace(HOOK_REGEXP, replaceHookName)
  const valueA = typeof value === 'string' ? value.trim().split('\n') : value
  return [hookA, valueA]
}

// We allow both `prebuild` and `preBuild` although the later one is preferred
const replaceHookName = function(full, prefix, char) {
  return `${prefix}${char.toUpperCase()}`
}

const HOOK_REGEXP = /^(pre|post)([a-zA-Z])/

module.exports = { normalizeConfig }
