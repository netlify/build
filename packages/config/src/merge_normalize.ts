import { normalizeConfigCase } from './case.js'
import { normalizeConfig } from './normalize.js'
import { addOrigins, CONFIG_ORIGIN } from './origin.js'
import type { ConfigOrigin, NormalizedNetlifyConfig } from './types/config.js'
import type { Logs } from './types/logs.js'
import { validateIdenticalPlugins } from './validate/identical.js'
import {
  parsePreCaseNormalize,
  parsePreMergeConfig,
  parsePreNormalizeConfig,
  validateConfigFile,
  validatePostNormalizeConfig,
} from './validate/main.js'
import { parseNormalizedConfig } from './validate/normalized.js'
import type { RawConfig, SourceCheckedConfig } from './validate/validations.js'

/**
 * Validate and normalize a single source (`netlify.toml`, `defaultConfig`, `inlineConfig`) or one
 * of its contexts, before sources are merged.
 */
export const normalizeBeforeConfigMerge = function (config: RawConfig, origin: ConfigOrigin): SourceCheckedConfig {
  const caseNormalized = normalizeConfigCase(parsePreCaseNormalize(config))
  const checked = parsePreMergeConfig(caseNormalized)

  if (origin === CONFIG_ORIGIN) {
    validateConfigFile(checked)
  }

  const withOrigins = addOrigins(checked, origin)
  validateIdenticalPlugins(withOrigins)
  return withOrigins
}

/** Validate and normalize the merge of all sources. */
export const normalizeAfterConfigMerge = function (
  config: SourceCheckedConfig,
  packagePath: string | undefined,
  logs: Logs | undefined,
): NormalizedNetlifyConfig {
  const normalized = normalizeConfig(parsePreNormalizeConfig(config), packagePath)
  validatePostNormalizeConfig(normalized)
  return parseNormalizedConfig(normalized, logs)
}
