const { resolve } = require('path')

const mapObj = require('map-obj')
const deepMerge = require('deepmerge')
const { get, set } = require('dot-prop')
const pathExists = require('path-exists')

// Normalize configuration object
const normalizeConfig = async function(config, baseDir) {
  const configA = deepMerge(DEFAULT_CONFIG, config)
  const configB = normalizeLifecycles({ config: configA })
  const configC = await addDefaultFunctions({ config: configB, baseDir })
  const configD = normalizePaths(configC, baseDir)
  return configD
}

const DEFAULT_CONFIG = { build: { publish: '.netlify/build/', lifecycle: {} }, plugins: [] }

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

// `build.functions` defaults to `./functions/` if the directory exists
const addDefaultFunctions = async function({
  config,
  config: {
    build,
    build: { functions },
  },
  baseDir,
}) {
  if (functions !== undefined) {
    return config
  }

  const defaultFunctions = resolve(baseDir, DEFAULT_FUNCTIONS)
  if (!(await pathExists(defaultFunctions))) {
    return config
  }

  return { ...config, build: { ...build, functions: defaultFunctions } }
}

const DEFAULT_FUNCTIONS = 'functions/'

// Resolve paths relatively to the config file.
// Also normalize paths to OS-specific path delimiters.
const normalizePaths = function(config, baseDir) {
  return PATHS.reduce(normalizePath.bind(null, baseDir), config)
}

const normalizePath = function(baseDir, config, path) {
  const value = get(config, path)

  if (typeof value !== 'string') {
    return config
  }

  return set(config, path, resolve(baseDir, value))
}

const PATHS = ['build.publish', 'build.functions']

module.exports = { normalizeConfig }
