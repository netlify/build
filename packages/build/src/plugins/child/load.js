const { getOverride } = require('../override')
const { validatePluginConfig } = require('../config/validate_props.js')

const { getLogic } = require('./logic')
const { validatePlugin } = require('./validate')
const { normalizePlugin } = require('./normalize')
const { getApiClient } = require('./api')
const { getConstants } = require('./constants')

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of hooks. This is also passed to the parent.
const loadPlugin = async function(payload) {
  const constants = await getConstants(payload)
  const logic = getLogic(payload, constants)

  validatePlugin(logic)
  validatePluginConfig(logic, payload)

  const logicA = normalizePlugin(logic)

  const hooks = getPluginHooks(logicA, payload)

  const context = getContext(logicA, hooks, constants, payload)
  return { context, hooks }
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
const getContext = function(logic, hooks, constants, { pluginConfig, config, token }) {
  const api = getApiClient({ logic, token })
  return { hooks, api, constants, pluginConfig, config }
}

module.exports = { loadPlugin }
