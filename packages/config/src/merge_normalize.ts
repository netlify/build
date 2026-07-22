import { normalizeConfigCase } from './case.js'
import { normalizeConfig } from './normalize.js'
import { addOrigins, CONFIG_ORIGIN } from './origin.js'
import { validateIdenticalPlugins } from './validate/identical.js'
import {
  validatePreCaseNormalize,
  validatePreMergeConfig,
  validateConfigFile,
  validatePreNormalizeConfig,
  validatePostNormalizeConfig,
} from './validate/main.js'

/**
 * Perform validation and normalization logic to apply to all of:
 *  - config, defaultConfig, inlineConfig
 *  - context-specific configs
 * Therefore, this is performing before merging those together.
 */
export const normalizeBeforeConfigMerge = function (config: $TSFixMe, origin) {
  validatePreCaseNormalize(config)
  const configA = normalizeConfigCase(config)
  validatePreMergeConfig(configA)

  // Some properties are only allowed to be set from the user's `netlify.toml`
  // file, so they are validated exclusively against that origin.
  if (origin === CONFIG_ORIGIN) {
    validateConfigFile(configA)
  }

  const configB = addOrigins(configA, origin) as $TSFixMe
  validateIdenticalPlugins(configB)
  return configB
}

/**
 * Validation and normalization logic performed after merging
 */
export const normalizeAfterConfigMerge = function (config: $TSFixMe, packagePath?: string) {
  validatePreNormalizeConfig(config)
  const configA = normalizeConfig(config, packagePath)
  validatePostNormalizeConfig(configA)
  return configA
}
