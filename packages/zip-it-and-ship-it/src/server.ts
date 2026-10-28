import { promises as fs } from 'fs'
import { extname, join, resolve } from 'path'

import { ARCHIVE_FORMAT } from './archive.js'
import { isValidRange } from './config.js'
import type { FeatureFlags } from './feature_flags.js'
import type { FunctionSource } from './function.js'
import { getFunctionFromPath } from './runtimes/index.js'
import { parseFile, serverConfig, type ServerConfig } from './runtimes/node/in_source_config/index.js'
import { RUNTIME, type RuntimeName } from './runtimes/runtime.js'
import type { RuntimeCache } from './utils/cache.js'
import { FunctionBundlingUserError } from './utils/error.js'
import { formatZipResult } from './utils/format_result.js'
import { removeUndefined } from './utils/remove_undefined.js'
import type { getLogger } from './utils/logger.js'
import { getRoutes } from './utils/routes.js'
import type { ExtendedRoute, Route } from './utils/routes.js'

const DEFAULT_SERVER_PATHS = ['/*']

// Names the server's archive. Everywhere else it is only a label, identifying
// the server in bundling errors, since a server has no name of its own.
const SERVER_NAME = 'server'

const SERVER_ENTRY_BASENAMES = new Set(['index.js', 'index.mjs', 'index.ts', 'index.mts'])

/**
 * Resolves the server entrypoint inside `directory`, or undefined when there is
 * none.
 */
export const findServerEntry = async (directory: string): Promise<string | undefined> => {
  let entries: string[]

  try {
    entries = await fs.readdir(directory)
  } catch (error) {
    const { code } = error as NodeJS.ErrnoException

    if (code === 'ENOENT' || code === 'ENOTDIR') {
      return undefined
    }

    throw error
  }

  const candidates = entries.filter((name) => SERVER_ENTRY_BASENAMES.has(name)).sort()

  if (candidates.length === 0) {
    return undefined
  }

  if (candidates.length > 1) {
    throw new Error(
      `Found multiple server entrypoints in ${directory} (${candidates.join(', ')}). A site can have one server only.`,
    )
  }

  return join(directory, candidates[0])
}

// A server always sets `preferStatic: true`.
const toServerRoutes = (paths: string[] = DEFAULT_SERVER_PATHS): ExtendedRoute[] =>
  getRoutes(SERVER_NAME, paths).map((route) => ({ ...route, prefer_static: true }))

const toExcludedServerRoutes = (paths: string[] = []): Route[] | undefined =>
  paths.length === 0 ? undefined : getRoutes(SERVER_NAME, paths)

/**
 * How many instances the server runs.
 */
export type ServerScale = {
  min?: number
  max?: number
}

/**
 * Server configuration from the `[server]` block of the Netlify configuration
 * file. The server's in-source configuration takes precedence over it.
 */
export interface NetlifyServerConfig {
  excludedPath?: string | string[]
  includedFiles?: string[]
  path?: string | string[]
  region?: string
  scale?: ServerScale
  size?: string
}

const parseNetlifyServerConfig = (config: NetlifyServerConfig = {}): ServerConfig => {
  const { data, error, success } = serverConfig.safeParse(config)

  if (success) {
    return data
  }

  const [issue] = error.issues
  const location = issue.path.length === 0 ? '' : ` on '${issue.path.join('.')}'`

  throw new FunctionBundlingUserError(
    `Netlify Server has a configuration error in the [server] block${location}: ${issue.message}`,
    { functionName: SERVER_NAME, runtime: RUNTIME.JAVASCRIPT },
  )
}

// `min` and `max` are merged separately, so each source can set one of them.
const mergeServerScale = (inSource: ServerScale = {}, fromNetlifyConfig: ServerScale = {}): ServerScale | undefined => {
  const scale = removeUndefined<ServerScale>({
    min: inSource.min ?? fromNetlifyConfig.min,
    max: inSource.max ?? fromNetlifyConfig.max,
  })

  if (scale.min === undefined && scale.max === undefined) {
    return undefined
  }

  if (!isValidRange(scale)) {
    throw new FunctionBundlingUserError(
      `Netlify Server has a configuration error on 'scale': 'min' (${String(scale.min)}) cannot be greater than 'max' (${String(scale.max)}) once the in-source configuration and the [server] block are combined`,
      { functionName: SERVER_NAME, runtime: RUNTIME.JAVASCRIPT },
    )
  }

  return scale
}

const mergeServerConfig = (inSource: ServerConfig, fromNetlifyConfig: ServerConfig): ServerConfig => ({
  excludedPath: inSource.excludedPath ?? fromNetlifyConfig.excludedPath,
  path: inSource.path ?? fromNetlifyConfig.path,
  region: inSource.region ?? fromNetlifyConfig.region,
  scale: mergeServerScale(inSource.scale, fromNetlifyConfig.scale),
  size: inSource.size ?? fromNetlifyConfig.size,
})

/**
 * Returns the routes the server at `entryPath` claims, read from its in-source
 * configuration and the `config` given, without bundling it.
 */
export const getServerRoutes = async (
  entryPath: string,
  { config }: { config?: NetlifyServerConfig } = {},
): Promise<ExtendedRoute[]> => {
  const fromNetlifyConfig = parseNetlifyServerConfig(config)
  const { config: inSource } = await parseFile(resolve(entryPath), { functionName: SERVER_NAME, isServer: true })

  return toServerRoutes(mergeServerConfig(inSource as ServerConfig, fromNetlifyConfig).path)
}

export type ServerResult = {
  bundler?: string
  excludedRoutes?: Route[]
  instanceSize?: string
  mainFile: string
  path: string
  region?: string
  routes?: ExtendedRoute[]
  runtime: RuntimeName
  runtimeVersion?: string
  scale?: ServerScale
  size?: number
}

/**
 * The deploy's Netlify Server, and how to bundle it.
 */
export interface ServerOptions {
  /**
   * Server configuration from the Netlify configuration file.
   */
  config?: NetlifyServerConfig

  /**
   * Path of the user's server entry file.
   */
  path: string
}

const readServerSource = async (
  srcPath: string,
  { cache, featureFlags }: { cache: RuntimeCache; featureFlags: FeatureFlags },
): Promise<FunctionSource> => {
  let source: FunctionSource | undefined

  // A server that cannot be read is the user's file being wrong, so it is
  // reported as a bundling failure rather than an internal error.
  const unreadable = (detail?: string) =>
    new FunctionBundlingUserError(`Could not read the Netlify Server at ${srcPath}${detail ? `: ${detail}` : ''}`, {
      functionName: SERVER_NAME,
      runtime: RUNTIME.JAVASCRIPT,
    })

  try {
    source = await getFunctionFromPath(srcPath, { cache, featureFlags })
  } catch (error) {
    throw unreadable((error as Error).message)
  }

  if (source === undefined) {
    throw unreadable()
  }

  return source
}

export const bundleServer = async (
  server: ServerOptions,
  destFolder: string,
  {
    basePath,
    cache,
    featureFlags,
    logger,
    repositoryRoot,
  }: {
    basePath?: string
    cache: RuntimeCache
    featureFlags: FeatureFlags
    logger: ReturnType<typeof getLogger>
    repositoryRoot?: string
  },
): Promise<ServerResult> => {
  const fromNetlifyConfig = parseNetlifyServerConfig(server.config)
  const srcPath = resolve(server.path)
  const source = await readServerSource(srcPath, { cache, featureFlags })

  if (fromNetlifyConfig.includedFiles !== undefined && basePath === undefined) {
    throw new Error('Netlify Server includedFiles from the [server] block need a basePath to resolve from')
  }

  // Included files from the [server] block resolve from the base path.
  // In-source ones resolve from the entry file and replace them.
  const functionConfig =
    fromNetlifyConfig.includedFiles === undefined
      ? source.config
      : { ...source.config, includedFiles: fromNetlifyConfig.includedFiles, includedFilesBasePath: basePath }

  const zipResult = await source.runtime.zipFunction({
    archiveFormat: ARCHIVE_FORMAT.ZIP,
    basePath,
    cache,
    config: functionConfig,
    destFolder,
    extension: source.extension,
    featureFlags,
    filename: source.filename,
    isInternal: true,
    isServer: true,
    logger,
    mainFile: source.mainFile,
    name: SERVER_NAME,
    repositoryRoot,
    runtime: source.runtime,
    srcDir: source.srcDir,
    srcPath,
    stat: source.stat,
  })

  const path = join(destFolder, `${SERVER_NAME}${extname(zipResult.path)}`)

  await fs.rename(zipResult.path, path)

  const result = formatZipResult({
    ...zipResult,
    mainFile: source.mainFile,
    name: SERVER_NAME,
    path,
    runtime: source.runtime,
  })

  const inSource = (zipResult.staticAnalysisResult?.config ?? {}) as ServerConfig
  const config = mergeServerConfig(inSource, fromNetlifyConfig)

  return removeUndefined<ServerResult>({
    bundler: result.bundler,
    excludedRoutes: toExcludedServerRoutes(config.excludedPath),
    instanceSize: config.size,
    mainFile: result.mainFile,
    path: result.path,
    region: config.region,
    routes: toServerRoutes(config.path),
    runtime: result.runtime,
    runtimeVersion: result.runtimeVersion,
    scale: config.scale,
    size: result.size,
  })
}
