import { logInlineConfig } from './log/main.js'
import { applyMutations } from './mutations/apply.js'

// Retrieve the `--inlineConfig` CLI flag
export const getInlineConfig = function ({ inlineConfig, configMutations, logs, debug }) {
  const mutatedInlineConfig = applyMutations(inlineConfig, configMutations)
  logInlineConfig(mutatedInlineConfig, { logs, debug })
  return mutatedInlineConfig
}
