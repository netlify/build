'use strict'

// Retrieve the first `base` directory used to load the first config file.
const getInitialBase = function ({
  defaultConfig: { build: { base: defaultBase } = {} },
  inlineConfig: { build: { base: initialBase = defaultBase } = {} },
}) {
  return initialBase
}

module.exports = { getInitialBase }
