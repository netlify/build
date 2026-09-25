import { promises as fs } from 'fs'
import { extname, join, resolve } from 'path'

import { ARCHIVE_FORMAT } from './archive.js'
import type { FeatureFlags } from './feature_flags.js'
import type { FunctionSource } from './function.js'
import { getFunctionFromPath } from './runtimes/index.js'
import type { RuntimeName } from './runtimes/runtime.js'
import type { RuntimeCache } from './utils/cache.js'
import { formatZipResult } from './utils/format_result.js'
import { removeUndefined } from './utils/remove_undefined.js'
import type { getLogger } from './utils/logger.js'
import { getRoutes } from './utils/routes.js'
import type { ExtendedRoute, Route } from './utils/routes.js'

// A server claims every path the rest of the deploy does not.
const SERVER_ROUTE = '/*'

// Names the server's archive, and the function it is bundled as.
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

export type ServerResult = {
  bundler?: string
  excludedRoutes?: Route[]
  mainFile: string
  memory?: number
  path: string
  region?: string
  routes?: ExtendedRoute[]
  runtime: RuntimeName
  runtimeVersion?: string
  size?: number
  vcpu?: number
}

/**
 * The deploy's Netlify Server, and how to bundle it.
 */
export interface ServerOptions {
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

  try {
    source = await getFunctionFromPath(srcPath, { cache, featureFlags })
  } catch (error) {
    throw new Error(`Could not read the Netlify Server at ${srcPath}: ${(error as Error).message}`)
  }

  if (source === undefined) {
    throw new Error(`Could not read the Netlify Server at ${srcPath}`)
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
  const srcPath = resolve(server.path)
  const source = await readServerSource(srcPath, { cache, featureFlags })

  const zipResult = await source.runtime.zipFunction({
    archiveFormat: ARCHIVE_FORMAT.ZIP,
    basePath,
    cache,
    config: source.config,
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

  return removeUndefined<ServerResult>({
    bundler: result.bundler,
    excludedRoutes: result.excludedRoutes,
    mainFile: result.mainFile,
    memory: result.memory,
    path: result.path,
    region: result.region,
    routes: getRoutes(SERVER_NAME, SERVER_ROUTE).map((route) => ({ ...route, prefer_static: true })),
    runtime: result.runtime,
    runtimeVersion: result.runtimeVersion,
    size: result.size,
    vcpu: result.vcpu,
  })
}
