import { promises as fs } from 'fs'
import { join, resolve } from 'path'

import type { ArchiveFormat } from './archive.js'
import type { Config } from './config.js'
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

// Names the server's output folder, its archive and its entry in the manifest.
const SERVER_NAME = 'server'

/**
 * A bundled Netlify Server. It is built like a function, but it is described on
 * its own terms: it carries no schedule, event subscriptions, invocation mode,
 * priority or timeout, because it is not invoked per request.
 */
export type ServerResult = {
  bundler?: string
  excludedRoutes?: Route[]
  mainFile: string
  memory?: number
  name: string
  path: string
  region?: string
  routes?: ExtendedRoute[]
  runtime: RuntimeName
  runtimeVersion?: string
  size?: number
  vcpu?: number
}

/**
 * The deploy's Netlify Server, and how to bundle it. Set by whatever generates
 * the server, not by the user.
 */
export interface ServerOptions {
  /**
   * Path of the user's server entry file.
   */
  path: string
}

// A server that cannot be read leaves the deploy with no backend at all, so it
// fails the build rather than coming up empty.
const readServerSource = async (
  srcPath: string,
  { cache, config, featureFlags }: { cache: RuntimeCache; config: Config; featureFlags: FeatureFlags },
): Promise<FunctionSource> => {
  let source: FunctionSource | undefined

  try {
    source = await getFunctionFromPath(srcPath, { cache, config, featureFlags })
  } catch (error) {
    throw new Error(`Could not read the Netlify Server at ${srcPath}: ${(error as Error).message}`)
  }

  if (source === undefined) {
    throw new Error(`Could not read the Netlify Server at ${srcPath}`)
  }

  return source
}

// Bundles a Netlify Server through the same runtime as a function, into its own
// folder so its archive does not land among theirs.
export const bundleServer = async (
  server: ServerOptions,
  destFolder: string,
  {
    archiveFormat,
    basePath,
    cache,
    config,
    featureFlags,
    logger,
    repositoryRoot,
  }: {
    archiveFormat: ArchiveFormat
    basePath?: string
    cache: RuntimeCache
    config: Config
    featureFlags: FeatureFlags
    logger: ReturnType<typeof getLogger>
    repositoryRoot?: string
  },
): Promise<ServerResult> => {
  const srcPath = resolve(server.path)
  const source = await readServerSource(srcPath, { cache, config, featureFlags })

  const serverFolder = join(destFolder, SERVER_NAME)

  await fs.mkdir(serverFolder, { recursive: true })

  const zipResult = await source.runtime.zipFunction({
    archiveFormat,
    basePath,
    cache,
    config: source.config,
    destFolder: serverFolder,
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

  const result = formatZipResult({
    ...zipResult,
    mainFile: source.mainFile,
    name: SERVER_NAME,
    runtime: source.runtime,
  })

  return removeUndefined<ServerResult>({
    bundler: result.bundler,
    excludedRoutes: result.excludedRoutes,
    mainFile: result.mainFile,
    memory: result.memory,
    name: result.name,
    path: result.path,
    region: result.region,
    routes: getRoutes(SERVER_NAME, SERVER_ROUTE).map((route) => ({ ...route, prefer_static: true })),
    runtime: result.runtime,
    runtimeVersion: result.runtimeVersion,
    size: result.size,
    vcpu: result.vcpu,
  })
}
