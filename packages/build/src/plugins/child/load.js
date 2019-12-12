const gitData = require('@netlify/utils-git')

const { getOverride } = require('../override')
const { validatePluginConfig } = require('../config/validate_props.js')

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
  const logic = getLogic(payload, constants)

  validatePlugin(logic)
  validatePluginConfig(logic, payload)

  const logicA = normalizePlugin(logic)

  const pluginCommands = getPluginCommands(logicA, payload)


  // @TODO add additional way to specify which commit / branch to diff from
  const ref = process.env.CACHED_COMMIT_REF || 'master'
  // @TODO hoist gitData top level?
  const git = await gitData({ base: ref })

  const context = await getContext(logicA, pluginCommands, constants, payload, git)
  return { context, pluginCommands }
}

const getPluginCommands = function(logic, { id, type, core }) {
  const { name } = logic
  return Object.entries(logic)
    .filter(isEventHandler)
    .map(([event, method]) => getPluginCommand({ method, event, name, id, type, core }))
}

const isEventHandler = function([, value]) {
  return typeof value === 'function'
}

// Retrieve a single command from this plugin
const getPluginCommand = function({ method, event, name, id = name, type, core }) {
  const override = getOverride(event)
  const eventA = override.event || event
  return { method, id, name, type, event: eventA, originalEvent: event, override, core }
}

// Retrieve context passed to every hook method
const getContext = async function(logic, pluginCommands, constants, { pluginPath, pluginConfig, config, token }, git) {
  const api = getApiClient({ logic, token })
  const utils = await getUtils(pluginPath)

  // Assign core utils
  const allUtils = Object.assign({}, utils, { git })

  return { pluginCommands, api, utils: allUtils, constants, pluginConfig, config }
}

module.exports = { loadPlugin }
