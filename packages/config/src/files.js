'use strict'

const { resolve } = require('path')

const pathExists = require('path-exists')
const { isDirectory } = require('path-type')

const { throwError } = require('./error')
const { mergeConfigs } = require('./utils/merge')

// Make configuration paths relative to `buildDir` and converts them to
// absolute paths
const handleFiles = async function ({ config: { build, ...config }, repositoryRoot, baseRelDir }) {
  const buildA = resolvePaths(build, REPOSITORY_RELATIVE_PROPS, repositoryRoot)
  const buildDir = await getBuildDir(repositoryRoot, buildA)
  const baseRel = baseRelDir ? buildDir : repositoryRoot
  const buildB = resolvePaths(buildA, BUILD_DIR_RELATIVE_PROPS, baseRel)
  const configA = resolvePaths(config, ['functionsDirectory'], baseRel)
  const configB = await addDefaultPaths({ ...configA, build: buildB }, baseRel)

  return { config: configB, buildDir }
}

// All file paths in the configuration file.
// Most are relative to `buildDir` (if `baseRelDir` is `true`). But `build.base`
// itself is never relative to `buildDir` since it is contained in it.
const REPOSITORY_RELATIVE_PROPS = ['base']
const BUILD_DIR_RELATIVE_PROPS = ['publish', 'edge_handlers']

const resolvePaths = function (build, propNames, baseRel) {
  return propNames.reduce((buildA, propName) => resolvePathProp(buildA, propName, baseRel), build)
}

const resolvePathProp = function (object, propName, baseRel) {
  if (object[propName] === undefined) {
    return object
  }

  const path = resolvePath(baseRel, object[propName])
  return { ...object, [propName]: path }
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
const addDefaultPaths = async function (config, baseRel) {
  const defaultPathsConfigs = await Promise.all(
    DEFAULT_PATHS.map(({ defaultPath, getConfig }) => addDefaultPath({ baseRel, defaultPath, getConfig })),
  )
  const defaultPathsConfigsA = defaultPathsConfigs.filter(Boolean)
  return mergeConfigs([...defaultPathsConfigsA, config])
}

const DEFAULT_PATHS = [
  // @todo Remove once we drop support for the legact default functions directory.
  {
    getConfig: (directory) => ({ functionsDirectory: directory, functionsDirectoryOrigin: 'default-v1' }),
    defaultPath: 'netlify-automatic-functions',
  },
  {
    getConfig: (directory) => ({ functionsDirectory: directory, functionsDirectoryOrigin: 'default' }),
    defaultPath: 'netlify/functions',
  },
  { getConfig: (directory) => ({ build: { edge_handlers: directory } }), defaultPath: 'edge-handlers' },
]

const addDefaultPath = async function ({ baseRel, defaultPath, getConfig }) {
  const absolutePath = resolvePath(baseRel, defaultPath)

  if (!(await pathExists(absolutePath))) {
    return
  }

  return getConfig(absolutePath)
}

module.exports = { handleFiles, resolvePath }
