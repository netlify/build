'use strict'

const { resolve } = require('path')

const { get, set, delete: deleteProp } = require('dot-prop')
const pathExists = require('path-exists')

const { mergeConfigs } = require('./utils/merge')
const { isTruthy } = require('./utils/remove_falsy')

// Make configuration paths relative to `buildDir` and converts them to
// absolute paths
const resolveConfigPaths = async function ({ config, repositoryRoot, buildDir, baseRelDir }) {
  const baseRel = baseRelDir ? buildDir : repositoryRoot
  const configA = resolvePaths(config, FILE_PATH_CONFIG_PROPS, baseRel)
  const configB = await addDefaultPaths(configA, baseRel)
  return configB
}

// All file paths in the configuration file are are relative to `buildDir`
// (if `baseRelDir` is `true`).
const FILE_PATH_CONFIG_PROPS = ['functionsDirectory', 'build.publish', 'build.edge_handlers']

const resolvePaths = function (config, propNames, baseRel) {
  return propNames.reduce((configA, propName) => resolvePathProp(configA, propName, baseRel), config)
}

const resolvePathProp = function (config, propName, baseRel) {
  const path = get(config, propName)

  if (!isTruthy(path)) {
    deleteProp(config, propName)
    return config
  }

  return set(config, propName, resolvePath(baseRel, path))
}

const resolvePath = function (baseRel, path) {
  if (!isTruthy(path)) {
    return
  }

  const pathA = path.replace(LEADING_SLASH_REGEXP, '')
  const pathB = resolve(baseRel, pathA)
  return pathB
}

// We allow paths in configuration file to start with /
// In that case, those are actually relative paths not absolute.
const LEADING_SLASH_REGEXP = /^\/+/

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

module.exports = { resolveConfigPaths, resolvePath }
