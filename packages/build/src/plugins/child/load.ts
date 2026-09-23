import { getLogic } from './logic.js'
import { registerTypeScript } from './typescript.js'
import { validatePlugin } from './validate.js'

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of plugin steps. This is also passed to the parent.
// The parent sends these over IPC. Only `pluginPath` is read here: the rest is passed on.
type LoadPayload = {
  pluginPath: string
  inputs: unknown
  packageJson: unknown
  verbose: unknown
  netlifyConfig: unknown
}

export const load = async function ({ pluginPath, inputs, packageJson, verbose, netlifyConfig }: LoadPayload) {
  const tsNodeService = registerTypeScript(pluginPath)
  const logic = await getLogic({ pluginPath, inputs, tsNodeService, netlifyConfig })

  validatePlugin(logic)

  const methods = Object.fromEntries(
    Object.entries(logic as Record<string, unknown>).filter(([, value]) => isEventHandler(value)),
  )
  const events = Object.keys(methods)

  // Context passed to every event handler
  const context = { methods, inputs, packageJson, verbose }

  return { events, context }
}

const isEventHandler = function (value: unknown): boolean {
  return typeof value === 'function'
}
