const { getOverride } = require('../override')
const { validatePluginConfig } = require('../config/validate_props.js')
const { getInputs } = require('../outputs/input')

const { getLogic } = require('./logic')
const { validatePlugin } = require('./validate')
const { normalizePlugin } = require('./normalize')
const { getApiClient } = require('./api')
const { getUtils } = require('./utils')
const { getConstants } = require('./constants')

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of plugin commands. This is also passed to the parent.
const loadPlugin = async function(payload) {
  const constants = await getConstants(payload)
  const logic = getLogic(payload)

  validatePlugin(logic)
  validatePluginConfig(logic, payload)

  const logicA = normalizePlugin(logic)

  const pluginCommands = getPluginCommands(logicA, payload)

  const context = getContext(logicA, pluginCommands, constants, payload)
  return { context, pluginCommands }
}

const getPluginCommands = function(logic, { id, package, core }) {
  const { name } = logic
  return Object.entries(logic)
    .filter(isEventHandler)
    .map(([event, method]) => getPluginCommand({ method, event, name, id, package, core }))
}

const isEventHandler = function([, value]) {
  return typeof value === 'function'
}

// Retrieve a single command from this plugin
const getPluginCommand = function({ method, event, name, id = name, package, core }) {
  const override = getOverride(event)
  const eventA = override.event || event
  return { method, id, name, package, event: eventA, originalEvent: event, override, core }
}

// Retrieve context passed to every event handler
const getContext = function(logic, pluginCommands, constants, { pluginConfig, netlifyConfig, utilsData, token }) {
  const { outputs } = logic
  const api = getApiClient({ logic, token })
  const utils = getUtils({ utilsData, constants })
  const inputs = getInputs(pluginConfig)
  return { pluginCommands, api, utils, constants, pluginConfig, netlifyConfig, inputs, outputs }
}

module.exports = { loadPlugin }
