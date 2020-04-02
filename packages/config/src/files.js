const { resolve } = require('path')

const { throwError } = require('./error')
const { dirExists } = require('./utils/dir-exists')

// Make configuration paths relative to `buildDir` and converts them to
// absolute paths
const handleFiles = async function({ config: { build, ...config }, repositoryRoot, baseRelDir }) {
  const buildA = resolvePaths(build, REPOSITORY_RELATIVE_PROPS, repositoryRoot)
  const buildDir = await getBuildDir(repositoryRoot, buildA)
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
  const path = resolvePath(baseRel, build[propName])
  return path === undefined ? build : { ...build, [propName]: path }
}

const resolvePath = function(baseRel, path) {
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
const getBuildDir = async function(repositoryRoot, { base = repositoryRoot }) {
  const buildDir = resolve(repositoryRoot, base)
  await checkBuildDir(buildDir, repositoryRoot)
  return buildDir
}

// The build directory is used as the current directory of build commands and
// build plugins. Therefore it must exist.
// We already check `repositoryRoot` earlier in the code, so only need to check
// `buildDir` when it is the base directory instead.
const checkBuildDir = async function(buildDir, repositoryRoot) {
  if (buildDir === repositoryRoot || (await dirExists(buildDir))) {
    return
  }

  throwError(`Base directory does not exist: ${buildDir}`)
}

module.exports = { handleFiles, resolvePath }
