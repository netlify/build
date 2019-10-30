const { getEventFromParent, sendEventToParent } = require('../ipc')
const { getOverride } = require('../override')

const { getLogic } = require('./logic')
const { validatePlugin } = require('./validate')
const { getApiClient } = require('./api')
const { getConstants } = require('./constants')

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of hooks. This is also passed to the parent.
const loadPlugin = async function() {
  const { payload } = await getEventFromParent('load')

  const logic = getLogic(payload)
  validatePlugin(logic)

  const hooks = getPluginHooks(logic, payload)
  await sendEventToParent('load', hooks)

  const context = getContext(logic, hooks, payload)
  return context
}

const getPluginHooks = function(logic, { id, type, core }) {
  const { name } = logic
  return Object.entries(logic)
    .filter(isPluginHook)
    .map(([hook, method]) => getPluginHook({ method, hook, name, id, type, core }))
}

const isPluginHook = function([, value]) {
  return typeof value === 'function'
}

// Retrieve a single hook from this plugin
const getPluginHook = function({ method, hook, name, id = name, type, core }) {
  const override = getOverride(hook)
  const hookA = override.hook || hook
  return { method, id, name, type, hook: hookA, hookName: hook, override, core }
}

// Retrieve context passed to every hook method
const getContext = function(logic, hooks, { pluginConfig, config, configPath, token }) {
  const api = getApiClient({ logic, token })
  const constants = getConstants(configPath, config)
  return { hooks, api, constants, pluginConfig, config }
}

module.exports = { loadPlugin }
