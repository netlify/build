const { getApiClient } = require('./api')
const { getLogic } = require('./logic')
const { normalizePlugin } = require('./normalize')
const { getUtils } = require('./utils')
const { validatePlugin } = require('./validate')

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of plugin commands. This is also passed to the parent.
const loadPlugin = function(payload) {
  const logic = getLogic(payload)

  validatePlugin(logic)

  const logicA = normalizePlugin(logic)

  const pluginCommands = getPluginCommands(logicA)

  const context = getContext(pluginCommands, payload)
  return { context, pluginCommands }
}

const getPluginCommands = function(logic) {
  return Object.entries(logic)
    .filter(isEventHandler)
    .map(([event, method]) => ({ method, event }))
}

const isEventHandler = function([, value]) {
  return typeof value === 'function'
}

// Retrieve context passed to every event handler
const getContext = function(pluginCommands, { manifest, inputs, netlifyConfig, constants, utilsData, token }) {
  const utils = getUtils({ utilsData, constants })
  const api = getApiClient({ manifest, token, utils })
  return { pluginCommands, api, utils, constants, inputs, netlifyConfig }
}

module.exports = { loadPlugin }
