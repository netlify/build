'use strict'

const { logInlineConfig } = require('./log/main')

// Retrieve the `--inlineConfig` CLI flag
const getInlineConfig = function (inlineConfig, { logs, debug }) {
  if (inlineConfig === undefined) {
    return {}
  }

  logInlineConfig(inlineConfig, { logs, debug })
  return inlineConfig
}

module.exports = { getInlineConfig }
