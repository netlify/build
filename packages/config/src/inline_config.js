'use strict'

const { logInlineConfig } = require('./log/main')
const { removeFalsy } = require('./utils/remove_falsy')

// Retrieve the `--inlineConfig` CLI flag
const getInlineConfig = function ({ inlineConfig, logs, debug }) {
  if (inlineConfig === undefined) {
    return {}
  }

  const inlineConfigA = removeFalsyInlineConfig(inlineConfig)
  logInlineConfig(inlineConfigA, { logs, debug })
  return inlineConfigA
}

// Remove empty values from `--inlineConfig`
const removeFalsyInlineConfig = function ({ build = {}, ...inlineConfig }) {
  return removeFalsy({ ...inlineConfig, build: removeFalsy(build) })
}

module.exports = { getInlineConfig }
