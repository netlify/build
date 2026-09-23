import { throwContextPluginsConfig, warnContextPluginConfig } from '../log/messages.js'
import { UI_ORIGIN } from '../origin.js'
import type { Logs } from '../types/logs.js'

import type { SourceCheckedConfig } from './validations.js'

type ContextsPluginsOptions = {
  contextProps: Record<string, SourceCheckedConfig>
  plugins: Record<string, unknown>[] | undefined
  /** The contexts that apply to this build: the context and the branch. */
  contexts: string[]
  logs: Logs | undefined
}

/**
 * Configuring a UI-installed plugin under `[[context.{context}.plugins]]` only makes sense to set
 * context-specific inputs: the plugin runs in every context anyway. Warn when that happens, and
 * fail when the context entry has no inputs and this build isn't in that context, since the user
 * probably expected the plugin not to run.
 */
export const validateContextsPluginsConfig = function ({
  contextProps,
  plugins = [],
  contexts,
  logs,
}: ContextsPluginsOptions) {
  for (const [givenContext, { plugins: contextPlugins = [] }] of Object.entries(contextProps)) {
    for (const { package: packageName, inputs } of contextPlugins) {
      const isUiInstalled = plugins.some(
        (plugin) => plugin['package'] === packageName && plugin['origin'] === UI_ORIGIN,
      )
      if (!isUiInstalled) {
        continue
      }

      // Inputs are only validated once contexts are merged.
      if (contexts.every((context) => context !== givenContext) && Object.keys(inputs ?? {}).length === 0) {
        throwContextPluginsConfig(String(packageName), givenContext)
      }

      warnContextPluginConfig(logs, String(packageName), givenContext)
    }
  }
}
