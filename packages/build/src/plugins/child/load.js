'use strict'

const { getLogic } = require('./logic')
const { registerTypeScript } = require('./typescript')
const { validatePlugin } = require('./validate')

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of plugin steps. This is also passed to the parent.
const load = function ({ pluginPath, inputs, packageJson }) {
  registerTypeScript(pluginPath)
  const logic = getLogic({ pluginPath, inputs })

  validatePlugin(logic)

  const pluginSteps = getPluginSteps(logic)

  // Context passed to every event handler
  const context = { pluginSteps, inputs, packageJson }

  return { pluginSteps, context }
}

const getPluginSteps = function (logic) {
  return Object.entries(logic)
    .filter(isEventHandler)
    .map(([event, method]) => ({ event, method }))
}

const isEventHandler = function ([, value]) {
  return typeof value === 'function'
}

module.exports = { load }
