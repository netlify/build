'use strict'

const { logInlineConfig } = require('./log/main')
const { removeFalsy } = require('./utils/remove_falsy')

// Retrieve the `--inlineConfig` and `--priorityConfig` CLI flags
const getInlineConfig = function (inlineConfig, { configType, logs, debug }) {
  if (inlineConfig === undefined) {
    return {}
  }

  const inlineConfigA = removeFalsyInlineConfig(inlineConfig)
  logInlineConfig(inlineConfigA, { configType, logs, debug })
  return inlineConfigA
}

// Remove empty values from `--inlineConfig` and `--priorityConfig`
const removeFalsyInlineConfig = function ({ build = {}, ...inlineConfig }) {
  return removeFalsy({ ...inlineConfig, build: removeFalsy(build) })
}

module.exports = { getInlineConfig }
