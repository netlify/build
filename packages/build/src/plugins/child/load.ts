import { includeKeys } from 'filter-obj'

import { getLogic } from './logic.js'
import { registerTypeScript } from './typescript.js'
import { validatePlugin } from './validate.js'

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of plugin steps. This is also passed to the parent.
export const load = async function ({ pluginPath, inputs, packageJson, verbose, netlifyConfig }) {
  registerTypeScript(pluginPath)
  const logic = await getLogic({ pluginPath, inputs, netlifyConfig })

  validatePlugin(logic)

  const methods = includeKeys(logic, isEventHandler)
  const events = Object.keys(methods)

  // Context passed to every event handler
  const context = { methods, inputs, packageJson, verbose }

  return { events, context }
}

const isEventHandler = function (_event: unknown, value: unknown): boolean {
  return typeof value === 'function'
}
