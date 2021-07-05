'use strict'

// Ensure `config` has a higher priority than `context` properties
const normalizeConfigPriority = function (config, { context, branch }) {
  return { context: { [context]: config, [branch]: config } }
}

module.exports = { normalizeConfigPriority }
