import { existsSync } from 'fs'
import { join, parse, relative, resolve } from 'path'

import isPlainObj from 'is-plain-obj'

import { throwUserError } from './error.js'
import { mergeConfigs } from './merge.js'
import type { NormalizedNetlifyConfig } from './types/config.js'
import { isTruthy } from './utils/remove_falsy.js'
import { setProp } from './utils/set.js'

/** Paths in the configuration may start with `/`, but are relative anyway. */
const LEADING_SLASH_REGEXP = /^\/+/

/**
 * Configuration properties that are file paths. Segments are literal, so `*` only means the
 * `functions['*']` entry.
 */
const FILE_PATH_CONFIG_PROPS = [
  'functionsDirectory',
  'functions.*.deno_import_map',
  'build.publish',
  'build.edge_functions',
  'database.migrations.path',
]

/** Configuration defaults that only apply when a directory exists in the build directory. */
const DEFAULT_PATHS = [
  // @todo Remove once we drop support for the legacy default functions directory.
  {
    getConfig: (directory: string) => ({ functionsDirectory: directory, functionsDirectoryOrigin: 'default-v1' }),
    defaultPath: 'netlify-automatic-functions',
    propName: 'functions.directory',
  },
  {
    getConfig: (directory: string) => ({ functionsDirectory: directory, functionsDirectoryOrigin: 'default' }),
    defaultPath: 'netlify/functions',
    propName: 'functions.directory',
  },
  {
    getConfig: (directory: string) => ({ build: { edge_functions: directory } }),
    defaultPath: 'netlify/edge-functions',
    propName: 'build.edge_functions',
  },
  {
    getConfig: (directory: string) => ({ database: { migrations: { path: directory } } }),
    defaultPath: 'netlify/database/migrations',
    propName: 'database.migrations.path',
  },
] as const

type ResolveConfigPathsOptions = {
  config: NormalizedNetlifyConfig
  repositoryRoot: string
  buildDir: string
  /** Resolve paths relative to the build directory rather than the repository root. */
  baseRelDir?: boolean
  packagePath?: string
}

/** Make file paths absolute, remove empty ones, and add the default directories that exist. */
export const resolveConfigPaths = function ({
  config,
  repositoryRoot,
  buildDir,
  baseRelDir,
  packagePath,
}: ResolveConfigPathsOptions): NormalizedNetlifyConfig {
  const baseRel = baseRelDir ? buildDir : repositoryRoot
  const resolvedConfig = FILE_PATH_CONFIG_PROPS.reduce(
    (resolved, propName) => resolvePathProp(resolved, propName.split('.'), baseRel, repositoryRoot),
    config,
  )
  const defaultPathsConfigs = DEFAULT_PATHS.flatMap(({ defaultPath, getConfig, propName }) => {
    const absolutePath = resolvePath(repositoryRoot, join(baseRel, packagePath ?? ''), defaultPath, propName)
    return absolutePath !== undefined && existsSync(absolutePath) ? [getConfig(absolutePath)] : []
  })
  return mergeConfigs<object>([...defaultPathsConfigs, resolvedConfig]) as NormalizedNetlifyConfig
}

const resolvePathProp = function (
  config: NormalizedNetlifyConfig,
  keys: string[],
  baseRel: string,
  repositoryRoot: string,
): NormalizedNetlifyConfig {
  const path = getPath(config, keys)

  if (!isTruthy(path)) {
    return deletePath(config, keys) as NormalizedNetlifyConfig
  }

  // Validation ensures file path properties are strings.
  return setProp(
    config,
    keys,
    resolvePath(repositoryRoot, baseRel, path as string, keys.join('.')),
  ) as NormalizedNetlifyConfig
}

const getPath = function (object: unknown, keys: string[]): unknown {
  return keys.reduce<unknown>((parent, key) => (isPlainObj(parent) ? parent[key] : undefined), object)
}

// Returns `object` itself when there is nothing to delete.
const deletePath = function (object: unknown, [key, ...childKeys]: string[]): unknown {
  if (!isPlainObj(object) || !(key in object)) {
    return object
  }

  if (childKeys.length === 0) {
    const { [key]: _deleted, ...rest } = object
    return rest
  }

  const child = object[key]
  const updatedChild = deletePath(child, childKeys)
  return updatedChild === child ? object : { ...object, [key]: updatedChild }
}

/** Resolve a path from the configuration, which must be inside the repository root. */
export const resolvePath = function (
  repositoryRoot: string,
  baseRel: string,
  originalPath: string | undefined,
  propName: string,
): string | undefined {
  if (!isTruthy(originalPath)) {
    return
  }

  const path = resolve(baseRel, originalPath.replace(LEADING_SLASH_REGEXP, ''))
  validateInsideRoot(originalPath, path, repositoryRoot, propName)
  return path
}

// Paths may be outside the build directory, which is convenient in monorepos.
const validateInsideRoot = function (originalPath: string, path: string, repositoryRoot: string, propName: string) {
  if (relative(repositoryRoot, path).startsWith('..') || parse(repositoryRoot).root !== parse(path).root) {
    throwUserError(
      `Configuration property "${propName}" "${originalPath}" must be inside the repository root directory.`,
    )
  }
}
