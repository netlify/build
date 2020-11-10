'use strict'

const { resolve } = require('path')

const pathExists = require('path-exists')
const { isDirectory } = require('path-type')

const { throwError } = require('./error')

// Make configuration paths relative to `buildDir` and converts them to
// absolute paths
const handleFiles = async function ({ config: { build, ...config }, repositoryRoot, baseRelDir }) {
  const buildA = resolvePaths(build, REPOSITORY_RELATIVE_PROPS, repositoryRoot)
  const buildDir = await getBuildDir(repositoryRoot, buildA)
  const baseRel = baseRelDir ? buildDir : repositoryRoot
  const buildB = resolvePaths(buildA, BUILD_DIR_RELATIVE_PROPS, baseRel)
  const buildC = await addDefaultPaths(buildB, baseRel)
  return { config: { ...config, build: buildC }, buildDir }
}

// All file paths in the configuration file.
// Most are relative to `buildDir` (if `baseRelDir` is `true`). But `build.base`
// itself is never relative to `buildDir` since it is contained in it.
const REPOSITORY_RELATIVE_PROPS = ['base']
const BUILD_DIR_RELATIVE_PROPS = ['publish', 'functions', 'edge_handlers']

const resolvePaths = function (build, propNames, baseRel) {
  return propNames.reduce((buildA, propName) => resolvePathProp(buildA, propName, baseRel), build)
}

const resolvePathProp = function (build, propName, baseRel) {
  if (build[propName] === undefined) {
    return build
  }

  const path = resolvePath(baseRel, build[propName])
  return { ...build, [propName]: path }
}

const resolvePath = function (baseRel, path) {
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
const getBuildDir = async function (repositoryRoot, { base = repositoryRoot }) {
  const buildDir = resolve(repositoryRoot, base)
  await checkBuildDir(buildDir, repositoryRoot)
  return buildDir
}

// The build directory is used as the current directory of build commands and
// build plugins. Therefore it must exist.
// We already check `repositoryRoot` earlier in the code, so only need to check
// `buildDir` when it is the base directory instead.
const checkBuildDir = async function (buildDir, repositoryRoot) {
  if (buildDir === repositoryRoot || (await isDirectory(buildDir))) {
    return
  }

  throwError(`Base directory does not exist: ${buildDir}`)
}

// Some configuration properties have default values that are only set if a
// specific directory/file exists in the build directory
const addDefaultPaths = async function (build, baseRel) {
  const props = await Promise.all(
    DEFAULT_PATHS.map(({ property, defaultPath }) => addDefaultPath({ build, property, baseRel, defaultPath })),
  )
  return Object.assign({}, build, ...props)
}

const DEFAULT_PATHS = [
  { property: 'functions', defaultPath: 'netlify-automatic-functions' },
  { property: 'edge_handlers', defaultPath: 'edge-handlers' },
]

const addDefaultPath = async function ({ build, property, baseRel, defaultPath }) {
  if (build[property] !== undefined) {
    return {}
  }

  const absolutePath = resolvePath(baseRel, defaultPath)
  if (!(await pathExists(absolutePath))) {
    return {}
  }

  return { [property]: absolutePath }
}

module.exports = { handleFiles, resolvePath }
