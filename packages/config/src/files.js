'use strict'

const { resolve } = require('path')

const { get, set } = require('dot-prop')
const pathExists = require('path-exists')
const { isDirectory } = require('path-type')

const { throwError } = require('./error')
const { warnBaseWithoutPublish } = require('./log/messages')
const { mergeConfigs } = require('./utils/merge')

// Make configuration paths relative to `buildDir` and converts them to
// absolute paths
const handleFiles = async function ({ config, repositoryRoot, baseRelDir, logs }) {
  warnBaseWithoutPublish(logs, config)
  const configA = resolvePaths(config, REPOSITORY_RELATIVE_PROPS, repositoryRoot)
  const buildDir = await getBuildDir(repositoryRoot, configA)
  const baseRel = baseRelDir ? buildDir : repositoryRoot
  const configB = resolvePaths(configA, FILE_PATH_CONFIG_PROPS, baseRel)
  const configC = await addDefaultPaths(configB, baseRel)
  return { config: configC, buildDir }
}

// All file paths in the configuration file.
// Most are relative to `buildDir` (if `baseRelDir` is `true`). But `build.base`
// itself is never relative to `buildDir` since it is contained in it.
const REPOSITORY_RELATIVE_PROPS = ['build.base']
const FILE_PATH_CONFIG_PROPS = ['functionsDirectory', 'build.publish', 'build.edge_handlers']

const resolvePaths = function (config, propNames, baseRel) {
  return propNames.reduce((configA, propName) => resolvePathProp(configA, propName, baseRel), config)
}

const resolvePathProp = function (config, propName, baseRel) {
  const path = get(config, propName)
  return path === undefined ? config : set(config, propName, resolvePath(baseRel, path))
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
const getBuildDir = async function (repositoryRoot, { build: { base = repositoryRoot } }) {
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
  // @todo Remove once we drop support for the legacy default functions directory.
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
