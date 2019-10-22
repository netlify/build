const { getOverride } = require('../override')

const { getLogic } = require('./logic')
const { validatePlugin } = require('./validate')
const { getConstants } = require('./constants')

// Retrieve list of hook methods of a plugin.
// This also validates the plugin.
const load = async function({ id, type, pluginPath, pluginConfig, configPath, config, core }) {
  const logic = getLogic({ pluginPath, config, pluginConfig })
  validatePlugin(logic, type)

  const constants = getConstants(configPath, config)
  const hooks = getPluginHooks({ logic, id, pluginPath, pluginConfig, type, core, constants })
  return hooks
}

const getPluginHooks = function({ logic, logic: { name }, id, pluginPath, pluginConfig, type, core, constants }) {
  return Object.entries(logic)
    .filter(isPluginHook)
    .map(([hook]) => getPluginHook({ hook, name, id, pluginPath, pluginConfig, type, core, constants }))
}

const isPluginHook = function([, value]) {
  return typeof value === 'function'
}

// Retrieve a single hook from this plugin
const getPluginHook = function({ hook, name, id = name, type, pluginPath, pluginConfig, core, constants }) {
  const override = getOverride(hook)
  const hookA = override.hook || hook
  return { id, name, type, hook: hookA, hookName: hook, override, pluginPath, pluginConfig, core, constants }
}

module.exports = { load }
