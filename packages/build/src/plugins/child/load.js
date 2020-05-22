const { getApiClient } = require('./api')
const { getLogic } = require('./logic')
const { validatePlugin } = require('./validate')

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of plugin commands. This is also passed to the parent.
const load = function(payload) {
  const logic = getLogic(payload)

  validatePlugin(logic)

  const pluginCommands = getPluginCommands(logic)

  const context = getContext(pluginCommands, payload)
  return { pluginCommands, context }
}

const getPluginCommands = function(logic) {
  return Object.entries(logic)
    .filter(isEventHandler)
    .map(([event, method]) => ({ event, method }))
}

const isEventHandler = function([, value]) {
  return typeof value === 'function'
}

// Retrieve context passed to every event handler
const getContext = function(pluginCommands, { manifest, inputs, netlifyConfig, constants, utilsData, token }) {
  const api = getApiClient({ manifest, token })
  return { pluginCommands, api, utilsData, constants, inputs, netlifyConfig }
}

module.exports = { load }
