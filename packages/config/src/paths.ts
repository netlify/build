import { access } from 'fs/promises'
import { join, parse, relative, resolve } from 'path'

import { throwUserError } from './error.js'
import { mergeConfigs } from './merge.js'
import type { NormalizedConfig, RawConfig } from './types.js'

const LEADING_SLASHES = /^\/+/

/** A leading slash still means relative to `baseRel`. */
export const resolveConfigPath = function (
  value: string | undefined,
  { baseRel, repositoryRoot, propertyName }: { baseRel: string; repositoryRoot: string; propertyName: string },
): string | undefined {
  if (value === undefined || value.trim() === '') {
    return
  }
  return resolveInsideRoot(value, { baseRel, repositoryRoot, propertyName })
}

const resolveInsideRoot = function (
  value: string,
  { baseRel, repositoryRoot, propertyName }: { baseRel: string; repositoryRoot: string; propertyName: string },
): string {
  const path = resolve(baseRel, value.replace(LEADING_SLASHES, ''))
  // `startsWith('..')` also rejects a directory named `..foo` directly inside the root (QUIRK).
  if (relative(repositoryRoot, path).startsWith('..') || parse(repositoryRoot).root !== parse(path).root) {
    throwUserError(`Configuration property "${propertyName}" "${value}" must be inside the repository root directory.`)
  }
  return path
}

export const resolvePaths = async function (
  config: NormalizedConfig,
  {
    baseRel,
    repositoryRoot,
    packagePath,
  }: { baseRel: string; repositoryRoot: string; packagePath: string | undefined },
): Promise<NormalizedConfig> {
  const withPaths = resolveConfiguredPaths(config, { baseRel, repositoryRoot })
  const defaults = await getDirectoryDefaults({ baseRel: join(baseRel, packagePath ?? ''), repositoryRoot })
  // Even without defaults, `mergeConfigs` moves `build` last, which shows in the JSON output. It only
  // adds keys to the checked configuration, which comes last and so keeps its values.
  return mergeConfigs<RawConfig>([...defaults, withPaths]) as NormalizedConfig
}

// In this order, which decides which error is reported. Blank values are removed, their parents kept.
const resolveConfiguredPaths = function (
  config: NormalizedConfig,
  { baseRel, repositoryRoot }: { baseRel: string; repositoryRoot: string },
): NormalizedConfig {
  const resolvePath = (value: string | undefined, propertyName: string) =>
    resolveConfigPath(value, { baseRel, repositoryRoot, propertyName })

  const functionsDirectory = resolvePath(config.functionsDirectory, 'functionsDirectory')
  // Only the `*` entry: named functions keep theirs as written.
  const denoImportMap = resolvePath(config.functions['*'].deno_import_map, 'functions.*.deno_import_map')
  // Normalization always sets a publish directory, so it is never blank.
  const publish = resolveInsideRoot(config.build.publish, { baseRel, repositoryRoot, propertyName: 'build.publish' })
  const edgeFunctions = resolvePath(config.build.edge_functions, 'build.edge_functions')
  const migrationsPath = resolvePath(config.database?.migrations?.path, 'database.migrations.path')

  // Copies whose properties are then replaced in place or deleted, so that key order is kept.
  const resolved: NormalizedConfig = {
    ...config,
    build: { ...config.build, publish },
    functions: { ...config.functions, '*': { ...config.functions['*'] } },
  }

  setOrDelete(resolved, 'functionsDirectory', functionsDirectory)
  setOrDelete(resolved.functions['*'], 'deno_import_map', denoImportMap)
  setOrDelete(resolved.build, 'edge_functions', edgeFunctions)
  if (config.database?.migrations !== undefined) {
    const migrations = { ...config.database.migrations }
    setOrDelete(migrations, 'path', migrationsPath)
    resolved.database = { ...config.database, migrations }
  }

  return resolved
}

const setOrDelete = function <Key extends string>(
  object: Partial<Record<Key, string | undefined>>,
  key: Key,
  value: string | undefined,
): void {
  if (value === undefined) {
    Reflect.deleteProperty(object, key)
  } else {
    object[key] = value
  }
}

// Lowest priority first: `netlify/functions` beats the legacy directory.
const DIRECTORY_DEFAULTS = [
  {
    directory: 'netlify-automatic-functions',
    propertyName: 'functions.directory',
    getConfig: (path: string) => ({ functionsDirectory: path, functionsDirectoryOrigin: 'default-v1' }),
  },
  {
    directory: 'netlify/functions',
    propertyName: 'functions.directory',
    getConfig: (path: string) => ({ functionsDirectory: path, functionsDirectoryOrigin: 'default' }),
  },
  {
    directory: 'netlify/edge-functions',
    propertyName: 'build.edge_functions',
    getConfig: (path: string) => ({ build: { edge_functions: path } }),
  },
  {
    directory: 'netlify/database/migrations',
    propertyName: 'database.migrations.path',
    getConfig: (path: string) => ({ database: { migrations: { path } } }),
  },
]

const getDirectoryDefaults = async function ({
  baseRel,
  repositoryRoot,
}: {
  baseRel: string
  repositoryRoot: string
}): Promise<RawConfig[]> {
  const candidates = DIRECTORY_DEFAULTS.map(({ directory, propertyName, getConfig }) => {
    const path = resolveInsideRoot(directory, { baseRel, repositoryRoot, propertyName })
    return { path, config: getConfig(path) }
  })
  const defaults = await Promise.all(
    candidates.map(async ({ path, config }) => ((await pathExists(path)) ? [config] : [])),
  )
  return defaults.flat()
}

// Files count too (QUIRK).
const pathExists = async function (path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}
