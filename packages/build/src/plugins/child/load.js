const { EVENTS } = require('@netlify/config')

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

const getPluginCommands = function(logic, { id, package, core, pluginConfig }) {
  const { name, outputs } = logic
  const inputs = getInputs(pluginConfig)
  return Object.entries(logic)
    .filter(isEventHandler)
    .map(([event, method]) => getPluginCommand({ method, event, name, id, package, core, inputs, outputs }))
}

const isEventHandler = function([, value]) {
  return typeof value === 'function'
}

// Retrieve a single command from this plugin
const getPluginCommand = function({ method, event, name, id = name, package, core, inputs, outputs = {} }) {
  const override = getOverride(event)
  const eventA = override.event || event
  const outputsA = Object.entries(outputs)
    .filter(([, sinceEvent]) => EVENTS.indexOf(sinceEvent) <= EVENTS.indexOf(event))
    .map(getVarName)
  return { method, id, name, package, event: eventA, originalEvent: event, override, core, inputs, outputs: outputsA }
}

const getVarName = function([varName]) {
  return varName
}

// Retrieve context passed to every event handler
const getContext = function(logic, pluginCommands, constants, { pluginConfig, netlifyConfig, utilsData, token }) {
  const api = getApiClient({ logic, token })
  const utils = getUtils({ utilsData, constants })
  return { pluginCommands, api, utils, constants, pluginConfig, netlifyConfig }
}

module.exports = { loadPlugin }
