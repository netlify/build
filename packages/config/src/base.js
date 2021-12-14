import { resolvePath } from './files.js'

// Retrieve the first `base` directory used to load the first config file.
export const getInitialBase = function ({
  repositoryRoot,
  defaultConfig: { build: { base: defaultBase } = {} },
  inlineConfig: { build: { base: initialBase = defaultBase } = {} },
}) {
  return resolveBase(repositoryRoot, initialBase)
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
export const getBase = function (base, repositoryRoot, config) {
  return base === undefined ? resolveBase(repositoryRoot, config.build.base) : base
}

const resolveBase = function (repositoryRoot, base) {
  return resolvePath(repositoryRoot, repositoryRoot, base, 'build.base')
}

// Also `config.build.base`.
export const addBase = function (config, base) {
  return { ...config, build: { ...config.build, base } }
}
