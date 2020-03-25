const { resolve } = require('path')

// Make configuration paths relative to `buildDir` and converts them to
// absolute paths
const handleFiles = function({ config: { build, ...config }, repositoryRoot, baseRelDir }) {
  const buildA = resolvePaths(build, REPOSITORY_RELATIVE_PROPS, repositoryRoot)
  const buildDir = getBuildDir(repositoryRoot, buildA)
  const baseRel = baseRelDir ? buildDir : repositoryRoot
  const buildB = resolvePaths(buildA, BUILD_DIR_RELATIVE_PROPS, baseRel)
  return { config: { ...config, build: buildB }, buildDir }
}

// All file paths in the configuration file.
// Most are relative to `buildDir` (if `baseRelDir` is `true`). But `build.base`
// itself is never relative to `buildDir` since it is contained in it.
const REPOSITORY_RELATIVE_PROPS = ['base']
const BUILD_DIR_RELATIVE_PROPS = ['publish', 'functions']

const resolvePaths = function(build, propNames, baseRel) {
  return propNames.reduce((buildA, propName) => resolvePathProp(buildA, propName, baseRel), build)
}

const resolvePathProp = function(build, propName, baseRel) {
  const path = resolvePath(build[propName], baseRel)
  return path === undefined ? build : { ...build, [propName]: path }
}

const resolvePath = function(path, baseRel) {
  if (path === undefined) {
    return
  }

  const pathA = path.replace(LEADING_SLASH_REGEXP, '')
  const pathB = resolve(baseRel, pathA)
  return pathB
}

// We allow paths in configuration file to start with /
// In that case, those are actually relative paths not absolute.
const LEADING_SLASH_REGEXP = /^\/+/

// Retrieve the build directory used to resolve most paths.
// This is (in priority order):
//  - `build.base`
//  - `--repositoryRoot`
//  - the current directory (default value of `--repositoryRoot`)
const getBuildDir = function(repositoryRoot, { base = repositoryRoot }) {
  return resolve(repositoryRoot, base)
}

module.exports = { handleFiles, resolvePath }
