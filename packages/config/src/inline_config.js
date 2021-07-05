'use strict'

const { logInlineConfig } = require('./log/main')
const { applyMutations } = require('./mutations/apply')

// Retrieve the `--inlineConfig` CLI flag
const getInlineConfig = function ({ inlineConfig, configMutations, logs, debug }) {
  const mutatedInlineConfig = applyMutations(inlineConfig, configMutations)
  logInlineConfig(mutatedInlineConfig, { logs, debug })
  return mutatedInlineConfig
}

module.exports = { getInlineConfig }
