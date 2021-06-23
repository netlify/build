'use strict'

const { resolvePath } = require('./files')

// Retrieve the first `base` directory used to load the first config file.
const getInitialBase = function ({
  repositoryRoot,
  defaultConfig: { build: { base: defaultBase } = {} },
  inlineConfig: { build: { base: inlineBase = defaultBase } = {} },
  priorityConfig: { build: { base: initialBase = inlineBase } = {} },
}) {
  return resolvePath(repositoryRoot, initialBase)
}

// Two config files can be used:
//  - The first one, using the `config` property or doing a default lookup
//    of `netlify.toml`
//  - If the first one has a `base` property pointing to a directory with
//    another `netlify.toml`, that second config file is used instead.
// This retrieves the final `base` directory used:
//  - To load the second config file
//  - As the `buildDir`
//  - To resolve file paths
// If the second file has a `base` property, it is ignored, i.e. it is not
// recursive.
const getBase = function (base, repositoryRoot, config) {
  return base === undefined ? resolvePath(repositoryRoot, config.build.base) : base
}

// Also `config.build.base`.
const addBase = function (config, base) {
  return { ...config, build: { ...config.build, base } }
}

module.exports = { getInitialBase, getBase, addBase }
