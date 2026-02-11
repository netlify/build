import { existsSync } from 'fs'
import { resolve, relative, parse, join } from 'path'

import { getProperty, setProperty, deleteProperty } from 'dot-prop'

import { throwUserError } from './error.js'
import { mergeConfigs } from './merge.js'
import { isTruthy } from './utils/remove_falsy.js'

/**
 * We allow paths in configuration file to start with /
 * In that case, those are actually relative paths not absolute.
 */
const LEADING_SLASH_REGEXP = /^\/+/

/**
 * All file paths in the configuration file are relative to `buildDir`
 * (if `baseRelDir` is `true`).
 */
const FILE_PATH_CONFIG_PROPS = [
  'functionsDirectory',
  'functions.*.deno_import_map',
  'build.publish',
  'build.edge_functions',
  'db.migrations.path',
]

/**
 * Make configuration paths relative to `buildDir` and converts them to
 * absolute paths
 */
export const resolveConfigPaths = function (options: {
  config: $TSFixMe
  repositoryRoot: string
  buildDir: string
  baseRelDir?: boolean
  packagePath?: string
}) {
  const baseRel = options.baseRelDir ? options.buildDir : options.repositoryRoot
  const config = resolvePaths({
    config: options.config,
    propNames: FILE_PATH_CONFIG_PROPS,
    baseRel,
    repositoryRoot: options.repositoryRoot,
  })
  return addDefaultPaths({
    config,
    repositoryRoot: options.repositoryRoot,
    baseRel,
    packagePath: options.packagePath,
  })
}

const resolvePaths = function ({
  config,
  propNames,
  baseRel,
  repositoryRoot,
}: {
  config: $TSFixMe
  propNames: string[]
  baseRel: string
  repositoryRoot: string
}) {
  return propNames.reduce((configA, propName) => resolvePathProp(configA, propName, baseRel, repositoryRoot), config)
}

const resolvePathProp = function (config: $TSFixMe, propName: string, baseRel: string, repositoryRoot: string) {
  const path = getProperty(config, propName) as string | undefined

  if (!isTruthy(path)) {
    deleteProperty(config, propName)
    return config
  }

  return setProperty(config, propName, resolvePath(repositoryRoot, baseRel, path, propName))
}

export const resolvePath = (repositoryRoot: string, baseRel: string, originalPath: string, propName: string) => {
  if (!isTruthy(originalPath)) {
    return
  }

  const path = originalPath.replace(LEADING_SLASH_REGEXP, '')
  const pathA = resolve(baseRel, path)
  validateInsideRoot(originalPath, pathA, repositoryRoot, propName)
  return pathA
}

/**
 * We ensure all file paths are within the repository root directory.
 * However, we allow file paths to be outside the build directory, since this
 * can be convenient in monorepo setups.
 */
const validateInsideRoot = (originalPath: string, path: string, repositoryRoot: string, propName: string) => {
  if (relative(repositoryRoot, path).startsWith('..') || getWindowsDrive(repositoryRoot) !== getWindowsDrive(path)) {
    throwUserError(
      `Configuration property "${propName}" "${originalPath}" must be inside the repository root directory.`,
    )
  }
}

const getWindowsDrive = (path: string) => parse(path).root

/**
 * Some configuration properties have default values that are only set if a
 * specific directory/file exists in the build directory
 */
const addDefaultPaths = ({
  config,
  repositoryRoot,
  baseRel,
  packagePath,
}: {
  config: $TSFixMe
  repositoryRoot: string
  baseRel: string
  packagePath?: string
}) => {
  const defaultPathsConfigs = DEFAULT_PATHS.map(({ defaultPath, getConfig, propName }) =>
    addDefaultPath({ repositoryRoot, packagePath, baseRel, defaultPath, getConfig, propName }),
  ).filter(Boolean)
  return mergeConfigs([...defaultPathsConfigs, config])
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
    getConfig: (directory) => ({ build: { edge_functions: directory } }),
    defaultPath: 'netlify/edge-functions',
    propName: 'build.edge_functions',
  },
  {
    getConfig: (directory) => ({ db: { migrations: { path: directory } } }),
    defaultPath: 'netlify/db/migrations',
    propName: 'db.migrations.path',
  },
] as const

const addDefaultPath = ({
  repositoryRoot,
  packagePath,
  baseRel,
  defaultPath,
  getConfig,
  propName,
}: {
  repositoryRoot: string
  baseRel: string
  packagePath?: string
  defaultPath: $TSFixMe
  getConfig: (typeof DEFAULT_PATHS)[number]['getConfig']
  propName: (typeof DEFAULT_PATHS)[number]['propName']
}) => {
  const absolutePath = resolvePath(repositoryRoot, join(baseRel, packagePath || ''), defaultPath, propName)

  if (!absolutePath || !existsSync(absolutePath)) {
    return
  }

  return getConfig(absolutePath)
}
