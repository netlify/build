import { logInlineConfig } from './log/main.js'
import { applyMutations } from './mutations/apply.js'
import type { PartialNetlifyConfig } from './types/config.js'
import type { Logs } from './types/logs.js'
import type { ConfigMutation } from './types/mutations.js'
import type { RawConfig } from './validate/validations.js'

type InlineConfigOptions = {
  inlineConfig: PartialNetlifyConfig
  configMutations: ConfigMutation[]
  logs: Logs | undefined
  debug: boolean
}

/** The `inlineConfig` option, with the config mutations applied. Highest priority. */
export const getInlineConfig = function ({
  inlineConfig,
  configMutations,
  logs,
  debug,
}: InlineConfigOptions): RawConfig {
  const mutatedInlineConfig = applyMutations(inlineConfig, configMutations)
  logInlineConfig(mutatedInlineConfig, { logs, debug })
  return mutatedInlineConfig
}
