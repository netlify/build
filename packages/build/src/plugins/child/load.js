const filterObj = require('filter-obj')

const { getOverride } = require('../override')
const { sendEventToParent, getEventFromParent } = require('../ipc')

const { getLogics } = require('./logic')
const { validatePlugin } = require('./validate')
const { getApiClient } = require('./api')
const { getConstants } = require('./constants')

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// Do it when parent requests it using the `load` event.
// Also figure out the list of hooks. This is also passed to the parent.
const loadPlugin = async function() {
  const { payload } = await getEventFromParent('load')

  const logics = await getLogics(payload)
  logics.forEach(validatePlugin)

  const hooks = getPluginsHooks(payload, logics)

  const context = getContext(payload, { logics, hooks })

  await sendEventToParent('load', hooks)
  return context
}

// Retrieve the list of hooks from this plugin
const getPluginsHooks = function({ pluginId, type }, logics) {
  return logics.flatMap(logic => getPluginHooks({ logic, pluginId, type }))
}

const getPluginHooks = function({ logic, pluginId, type }) {
  const hooks = filterObj(logic, isPluginHook)
  return Object.entries(hooks).map(([hook, method]) => getPluginHook({ hook, type, method, pluginId }))
}

const isPluginHook = function(key, value) {
  return typeof value === 'function'
}

// Retrieve a single hook from this plugin
const getPluginHook = function({ hook, type, method, pluginId }) {
  const override = getOverride(hook)
  const hookA = override.hook || hook
  return { name: pluginId, hook: hookA, type, hookName: hook, method, override }
}

// Retrieve context passed to every hook method
const getContext = function({ pluginId, pluginConfig, type, config, configPath, baseDir, token }, { logics, hooks }) {
  const api = getApiClient({ logics, token, pluginId })
  const constants = getConstants(configPath, config, baseDir)
  return { hooks, api, constants, pluginConfig, config }
}

module.exports = { loadPlugin }
