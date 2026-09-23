import { normalizeConfigCase } from './case.js'
import { normalizeConfig } from './normalize.js'
import { addOrigins, CONFIG_ORIGIN } from './origin.js'
import type { ConfigOrigin, NormalizedNetlifyConfig, PartialNetlifyConfig } from './types/config.js'
import { validateIdenticalPlugins } from './validate/identical.js'
import {
  validateConfigFile,
  validatePostNormalizeConfig,
  validatePreCaseNormalize,
  validatePreMergeConfig,
  validatePreNormalizeConfig,
} from './validate/main.js'

/**
 * Validate and normalize a single source (`netlify.toml`, `defaultConfig`, `inlineConfig`) or one
 * of its contexts, before sources are merged.
 */
export const normalizeBeforeConfigMerge = function (
  config: PartialNetlifyConfig,
  origin: ConfigOrigin,
): PartialNetlifyConfig {
  validatePreCaseNormalize(config)
  const caseNormalized = normalizeConfigCase(config)
  validatePreMergeConfig(caseNormalized)

  if (origin === CONFIG_ORIGIN) {
    validateConfigFile(caseNormalized)
  }

  const withOrigins = addOrigins(caseNormalized, origin)
  validateIdenticalPlugins(withOrigins)
  return withOrigins
}

/** Validate and normalize the merge of all sources. */
export const normalizeAfterConfigMerge = function (
  config: PartialNetlifyConfig,
  packagePath?: string,
): NormalizedNetlifyConfig {
  validatePreNormalizeConfig(config)
  const normalized = normalizeConfig(config, packagePath)
  validatePostNormalizeConfig(normalized)
  return normalized
}
