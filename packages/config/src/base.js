'use strict'

const { resolvePath } = require('./files')

// Retrieve the first `base` directory used to load the first config file.
const getInitialBase = function ({
  defaultConfig: { build: { base: defaultBase } = {} },
  inlineConfig: { build: { base: initialBase = defaultBase } = {} },
}) {
  return initialBase
}

// Retrieve the final `base` directory used:
//  - To load the second config file
//  - As the `buildDir`
//  - To resolve file paths
// If the second file has a `base` property, it is ignored, i.e. it is not
// recursive.
// Also add it to `config.build.base`.
const addBase = function (repositoryRoot, config) {
  const base = resolvePath(repositoryRoot, config.build.base)
  const configA = { ...config, build: { ...config.build, base } }
  return { base, config: configA }
}

module.exports = { getInitialBase, addBase }
