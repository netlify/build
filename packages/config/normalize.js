const mapObj = require('map-obj')
const omit = require('omit.js')

// Normalize configuration object
const normalizeConfig = function(config) {
  const configA = Object.assign({ build: {}, plugins: {} }, config)
  const configB = normalizeLifecycles(configA)
  return configB
}

const normalizeLifecycles = function(config) {
  const {
    build,
    build: { command, lifecycle = {} }
  } = config
  const buildA = omit(build, ['command'])
  const lifecycleA = normalizeCommand(lifecycle, command)

  const lifecycleB = mapObj(lifecycleA, normalizeLifecycle)

  return Object.assign({}, config, {
    build: Object.assign({}, buildA, { lifecycle: lifecycleB })
  })
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
