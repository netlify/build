'use strict'

const { normalizeConfigCase } = require('./case')
const { normalizeConfig } = require('./normalize')
const { addOrigins } = require('./origin')
const { validateIdenticalPlugins } = require('./validate/identical.js')
const {
  validatePreCaseNormalize,
  validatePreMergeConfig,
  validatePreNormalizeConfig,
  validatePostNormalizeConfig,
} = require('./validate/main')

// Perform validation and normalization logic to apply to all of:
//  - config, defaultConfig, inlineConfig
//  - context-specific configs
// Therefore, this is performing before merging those together.
const normalizeBeforeConfigMerge = function (config, origin) {
  validatePreCaseNormalize(config)
  const configA = normalizeConfigCase(config)
  validatePreMergeConfig(configA)
  const configB = addOrigins(configA, origin)
  validateIdenticalPlugins(configB)
  return configB
}

// Validation and normalization logic performed after merging
const normalizeAfterConfigMerge = function (config) {
  validatePreNormalizeConfig(config)
  const configA = normalizeConfig(config)
  validatePostNormalizeConfig(configA)
  return configA
}

module.exports = {
  normalizeBeforeConfigMerge,
  normalizeAfterConfigMerge,
}
