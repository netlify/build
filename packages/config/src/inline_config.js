'use strict'

const { logInlineConfig } = require('./log/main')

// Retrieve the `--inlineConfig` and `--priorityConfig` CLI flags
const getInlineConfig = function (inlineConfig, { configType, logs, debug }) {
  if (inlineConfig === undefined) {
    return {}
  }

  logInlineConfig(inlineConfig, { configType, logs, debug })
  return inlineConfig
}

module.exports = { getInlineConfig }
