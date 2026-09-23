import type { PackageJson } from 'read-package-up'

import type { NetlifyConfig } from '../../types/config/netlify_config.js'

import { getLogic } from './logic.js'
import { registerTypeScript } from './typescript.js'
import { validatePlugin } from './validate.js'

export type LoadPayload = {
  pluginPath: string
  inputs: Record<string, unknown>
  packageJson: PackageJson
  verbose: boolean
  netlifyConfig: NetlifyConfig
}

// Plugin code is untyped: handlers receive the run options and may return anything
export type PluginMethod = (...args: unknown[]) => unknown

export type PluginContext = {
  methods: Record<string, PluginMethod>
  inputs: Record<string, unknown>
  packageJson: PackageJson
  verbose: boolean
}

// Load context passed to every plugin method.
// This also requires the plugin file and fire its top-level function.
// This also validates the plugin.
// Do it when parent requests it using the `load` event.
// Also figure out the list of plugin steps. This is also passed to the parent.
export const load = async function ({
  pluginPath,
  inputs,
  packageJson,
  verbose,
  netlifyConfig,
}: LoadPayload): Promise<{ events: string[]; context: PluginContext }> {
  const tsNodeService = registerTypeScript(pluginPath)
  const logic = await getLogic({ pluginPath, inputs, tsNodeService, netlifyConfig })

  validatePlugin(logic)

  const methods = Object.fromEntries(Object.entries(logic).filter(isEventHandlerEntry))
  const events = Object.keys(methods)

  // Context passed to every event handler
  const context = { methods, inputs, packageJson, verbose }

  return { events, context }
}

const isEventHandlerEntry = function (entry: [string, unknown]): entry is [string, PluginMethod] {
  return typeof entry[1] === 'function'
}
