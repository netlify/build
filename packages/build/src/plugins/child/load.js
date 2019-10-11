const { promisify } = require('util')

const resolve = require('resolve')

const { getOverride } = require('../override')

const { getLogic } = require('./logic')
const { validatePlugin } = require('./validate')
const { getConstants } = require('./constants')

const pResolve = promisify(resolve)

// Retrieve list of hook methods of a plugin.
// This also validates the plugin.
const load = async function({ pluginId, type, baseDir, pluginConfig, configPath, config, core }) {
  const pluginPath = await resolvePlugin(type, baseDir)

  const logic = getLogic(pluginPath, pluginConfig)
  validatePlugin(logic)

  const constants = getConstants(configPath, config, baseDir)
  const hooks = getPluginHooks({ logic, pluginId, pluginPath, pluginConfig, type, core, constants })
  return hooks
}

// We use `resolve` because `require()` should be relative to `baseDir` not to
// this `__filename`
const resolvePlugin = async function(type, baseDir) {
  try {
    return await pResolve(type, { basedir: baseDir })
  } catch (error) {
    // TODO: if plugin not found, automatically try to `npm install` it
    error.message = `'${type}' plugin not installed or found\n${error.message}`
    throw error
  }
}

const getPluginHooks = function({ logic, pluginId, pluginPath, pluginConfig, type, core, constants }) {
  return Object.entries(logic)
    .filter(isPluginHook)
    .map(([hook]) => getPluginHook({ hook, pluginId, pluginPath, pluginConfig, type, core, constants }))
}

const isPluginHook = function([, value]) {
  return typeof value === 'function'
}

// Retrieve a single hook from this plugin
const getPluginHook = function({ hook, pluginId, pluginPath, pluginConfig, type, core, constants }) {
  const override = getOverride(hook)
  const hookA = override.hook || hook
  return { name: pluginId, type, hook: hookA, hookName: hook, override, pluginPath, pluginConfig, core, constants }
}

module.exports = { load }
