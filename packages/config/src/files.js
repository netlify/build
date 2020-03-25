const { resolve } = require('path')

// Make configuration paths relative to `buildDir` and converts them to
// absolute paths
const handleFiles = function({ config: { build, ...config }, buildDir, repositoryRoot, baseRelDir }) {
  const buildA = PROP_NAMES.reduce(
    (build, propName) => normalizePath({ build, propName, buildDir, repositoryRoot, baseRelDir }),
    build,
  )
  return { ...config, build: buildA }
}

// All file paths in the configuration file
const PROP_NAMES = ['base', 'publish', 'functions']

const normalizePath = function({ build, propName, buildDir, repositoryRoot, baseRelDir }) {
  const path = build[propName]

  if (path === undefined) {
    return build
  }

  // `build.base` itself is never relative to `buildDir` since it is contained
  // in it
  const pathBase = baseRelDir && propName !== 'base' ? buildDir : repositoryRoot
  const pathA = path.replace(LEADING_SLASH_REGEXP, '')
  const pathB = resolve(pathBase, pathA)
  return { ...build, [propName]: pathB }
}

// We allow paths in configuration file to start with /
// In that case, those are actually relative paths not absolute.
const LEADING_SLASH_REGEXP = /^\/+/

module.exports = { handleFiles }
