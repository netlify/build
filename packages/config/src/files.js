import { resolve, relative, parse } from 'path'

import dotProp from 'dot-prop'
import pathExists from 'path-exists'

import { throwUserError } from './error.js'
import { mergeConfigs } from './merge.js'
import { isTruthy } from './utils/remove_falsy.js'

// Make configuration paths relative to `buildDir` and converts them to
// absolute paths
export const resolveConfigPaths = async function ({ config, repositoryRoot, buildDir, baseRelDir }) {
  const baseRel = baseRelDir ? buildDir : repositoryRoot
  const configA = resolvePaths(config, FILE_PATH_CONFIG_PROPS, baseRel, repositoryRoot)
  const configB = await addDefaultPaths(configA, repositoryRoot, baseRel)
  return configB
}

// All file paths in the configuration file are are relative to `buildDir`
// (if `baseRelDir` is `true`).
const FILE_PATH_CONFIG_PROPS = ['functionsDirectory', 'build.publish', 'build.edge_handlers']

const resolvePaths = function (config, propNames, baseRel, repositoryRoot) {
  return propNames.reduce((configA, propName) => resolvePathProp(configA, propName, baseRel, repositoryRoot), config)
}

const resolvePathProp = function (config, propName, baseRel, repositoryRoot) {
  const path = dotProp.get(config, propName)

  if (!isTruthy(path)) {
    dotProp.delete(config, propName)
    return config
  }

  return dotProp.set(config, propName, resolvePath(repositoryRoot, baseRel, path, propName))
}

export const resolvePath = function (repositoryRoot, baseRel, originalPath, propName) {
  if (!isTruthy(originalPath)) {
    return
  }

  const path = originalPath.replace(LEADING_SLASH_REGEXP, '')
  const pathA = resolve(baseRel, path)
  validateInsideRoot(originalPath, pathA, repositoryRoot, propName)
  return pathA
}

// We allow paths in configuration file to start with /
// In that case, those are actually relative paths not absolute.
const LEADING_SLASH_REGEXP = /^\/+/

// We ensure all file paths are within the repository root directory.
// However we allow file paths to be outside of the build directory, since this
// can be convenient in monorepo setups.
const validateInsideRoot = function (originalPath, path, repositoryRoot, propName) {
  if (relative(repositoryRoot, path).startsWith('..') || getWindowsDrive(repositoryRoot) !== getWindowsDrive(path)) {
    throwUserError(
      `Configuration property "${propName}" "${originalPath}" must be inside the repository root directory.`,
    )
  }
}

const getWindowsDrive = function (path) {
  return parse(path).root
}

// Some configuration properties have default values that are only set if a
// specific directory/file exists in the build directory
const addDefaultPaths = async function (config, repositoryRoot, baseRel) {
  const defaultPathsConfigs = await Promise.all(
    DEFAULT_PATHS.map(({ defaultPath, getConfig, propName }) =>
      addDefaultPath({ repositoryRoot, baseRel, defaultPath, getConfig, propName }),
    ),
  )
  const defaultPathsConfigsA = defaultPathsConfigs.filter(Boolean)
  return mergeConfigs([...defaultPathsConfigsA, config])
}

const DEFAULT_PATHS = [
  // @todo Remove once we drop support for the legacy default functions directory.
  {
    getConfig: (directory) => ({ functionsDirectory: directory, functionsDirectoryOrigin: 'default-v1' }),
    defaultPath: 'netlify-automatic-functions',
    propName: 'functions.directory',
  },
  {
    getConfig: (directory) => ({ functionsDirectory: directory, functionsDirectoryOrigin: 'default' }),
    defaultPath: 'netlify/functions',
    propName: 'functions.directory',
  },
  {
    getConfig: (directory) => ({ build: { edge_handlers: directory } }),
    defaultPath: 'netlify/edge-handlers',
    propName: 'build.edge_handlers',
  },
]

const addDefaultPath = async function ({ repositoryRoot, baseRel, defaultPath, getConfig, propName }) {
  const absolutePath = resolvePath(repositoryRoot, baseRel, defaultPath, propName)

  if (!(await pathExists(absolutePath))) {
    return
  }

  return getConfig(absolutePath)
}
