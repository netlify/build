'use strict'

const filterObj = require('filter-obj')

const { getLogic } = require('./logic')
const { registerTypeScript } = require('./typescript')
const { validatePlugin } = require('./validate')

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of plugin steps. This is also passed to the parent.
const load = async function ({ pluginPath, inputs, packageJson }) {
  const tsNodeService = registerTypeScript(pluginPath)
  const logic = await getLogic({ pluginPath, inputs, tsNodeService })

  validatePlugin(logic)

  const methods = filterObj(logic, isEventHandler)
  const events = Object.keys(methods)

  // Context passed to every event handler
  const context = { methods, inputs, packageJson }

  return { events, context }
}

const isEventHandler = function (event, value) {
  return typeof value === 'function'
}

module.exports = { load }
