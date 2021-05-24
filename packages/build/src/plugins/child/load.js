'use strict'

const { getLogic } = require('./logic')
const { preventConfigMutations } = require('./mutations')
const { validatePlugin } = require('./validate')

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of plugin commands. This is also passed to the parent.
const load = function ({ pluginPath, inputs, netlifyConfig, packageJson }) {
  const logic = getLogic({ pluginPath, inputs })

  validatePlugin(logic)

  const pluginCommands = getPluginCommands(logic)

  const netlifyConfigA = preventConfigMutations(netlifyConfig)

  // Context passed to every event handler
  const context = { pluginCommands, inputs, netlifyConfig: netlifyConfigA, packageJson }

  return { pluginCommands, context }
}

const getPluginCommands = function (logic) {
  return Object.entries(logic)
    .filter(isEventHandler)
    .map(([event, method]) => ({ event, method }))
}

const isEventHandler = function ([, value]) {
  return typeof value === 'function'
}

module.exports = { load }
