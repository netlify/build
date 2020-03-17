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

  const logicA = normalizePlugin(logic)

  const pluginCommands = getPluginCommands(logicA, payload)

  const context = await getContext(pluginCommands, payload)
  return { context, pluginCommands }
}

const getPluginCommands = function(logic, { package, core, local, packageJson }) {
  return Object.entries(logic)
    .filter(isEventHandler)
    .map(([event, method]) => ({ method, event, package, core, local, packageJson }))
}

const isEventHandler = function([, value]) {
  return typeof value === 'function'
}

// Retrieve context passed to every event handler
const getContext = async function(
  pluginCommands,
  { manifest, inputs, configPath, buildDir, netlifyConfig, siteInfo, utilsData, token },
) {
  const constants = await getConstants({ configPath, buildDir, netlifyConfig, siteInfo })
  const utils = getUtils({ utilsData, constants })
  const api = getApiClient({ manifest, token, utils })
  return { pluginCommands, api, utils, constants, inputs, netlifyConfig }
}

module.exports = { loadPlugin }
