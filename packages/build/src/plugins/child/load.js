const { validateInputs } = require('../config/validate_inputs')

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
  const logic = getLogic(payload)

  validatePlugin(logic)
  validateInputs(logic, payload)

  const logicA = normalizePlugin(logic)

  const pluginCommands = getPluginCommands(logicA, payload)

  const context = await getContext(logicA, pluginCommands, payload)
  return { context, pluginCommands }
}

const getPluginCommands = function(logic, { id, package, core, local, packageJson }) {
  const { name } = logic
  return Object.entries(logic)
    .filter(isEventHandler)
    .map(([event, method]) => getPluginCommand({ method, event, name, id, package, core, local, packageJson }))
}

const isEventHandler = function([, value]) {
  return typeof value === 'function'
}

// Retrieve a single command from this plugin
const getPluginCommand = function({ method, event, name, id = name, package, core, local, packageJson }) {
  return { method, id, name, package, event, core, local, packageJson }
}

// Retrieve context passed to every event handler
const getContext = async function(
  logic,
  pluginCommands,
  { inputs, configPath, buildDir, netlifyConfig, siteInfo, utilsData, token },
) {
  const constants = await getConstants({ configPath, buildDir, netlifyConfig, siteInfo })
  const utils = getUtils({ utilsData, constants })
  const api = getApiClient({ logic, token, utils })
  return { pluginCommands, api, utils, constants, inputs, netlifyConfig }
}

module.exports = { loadPlugin }
