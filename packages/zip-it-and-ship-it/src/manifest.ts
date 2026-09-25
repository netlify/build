import { promises as fs } from 'fs'
import { resolve } from 'path'
import { arch, platform } from 'process'

import type { InvocationMode } from './function.js'
import type { TrafficRules } from './rate_limit.js'
import type { ServerResult } from './server.js'
import type { FunctionResult } from './utils/format_result.js'
import type { ExtendedRoute, Route } from './utils/routes.js'

interface ManifestFunction {
  buildData?: Record<string, unknown>
  bundler?: string
  displayName?: string
  eventSubscriptions?: string[]
  excludedRoutes?: Route[]
  generator?: string
  invocationMode?: InvocationMode
  mainFile: string
  memory?: number
  name: string
  path: string
  priority?: number
  region?: string
  routes?: ExtendedRoute[]
  runtime: string
  runtimeVersion?: string
  schedule?: string
  timeout?: number
  trafficRules?: TrafficRules
  vcpu?: number
}

interface ManifestServer {
  bundler?: string
  excludedRoutes?: Route[]
  mainFile: string
  memory?: number
  path: string
  region?: string
  routes?: ExtendedRoute[]
  runtime: string
  runtimeVersion?: string
  vcpu?: number
}

interface ManifestBase {
  system: {
    arch: string
    platform: string
  }
  timestamp: number
  version: number
}

/**
 * What the functions build step writes next to the archives it produced.
 */
export interface FunctionsManifest extends ManifestBase {
  functions: ManifestFunction[]

  /**
   * A server is described by its own manifest now. Nothing writes this any
   * more; it is kept so that readers of manifests written before the split
   * still compile.
   */
  server?: ManifestServer
}

/**
 * What the server build step writes next to the archive it produced. It carries
 * no `functions` key: a deploy's functions are described by the manifest of the
 * step that built them, and an empty list here would read as "no functions".
 */
export interface ServerManifest extends ManifestBase {
  server: ManifestServer
}

/**
 * The functions manifest, under the name it has always had.
 */
export type Manifest = FunctionsManifest

const MANIFEST_VERSION = 1

type CreateManifestOptions = { path: string } & (
  | { functions: FunctionResult[]; server?: undefined }
  | { server: ServerResult; functions?: undefined }
)

export const createManifest = async ({ functions, path, server }: CreateManifestOptions) => {
  const payload: FunctionsManifest | ServerManifest =
    server === undefined
      ? {
          functions: functions.map((func) => formatFunctionForManifest(func)),
          system: { arch, platform },
          timestamp: Date.now(),
          version: MANIFEST_VERSION,
        }
      : {
          server: formatServerForManifest(server),
          system: { arch, platform },
          timestamp: Date.now(),
          version: MANIFEST_VERSION,
        }

  await fs.writeFile(path, JSON.stringify(payload))
}

const formatServerForManifest = ({
  bundler,
  excludedRoutes,
  mainFile,
  memory,
  path,
  region,
  routes,
  runtime,
  runtimeVersion,
  vcpu,
}: ServerResult): ManifestServer => {
  const server: ManifestServer = {
    bundler,
    mainFile,
    memory,
    path: resolve(path),
    region,
    runtime,
    runtimeVersion,
    vcpu,
  }

  if (routes?.length) {
    server.routes = routes
  }

  if (excludedRoutes?.length) {
    server.excludedRoutes = excludedRoutes
  }

  return server
}

const formatFunctionForManifest = ({
  bootstrapVersion,
  bundler,
  displayName,
  eventSubscriptions,
  excludedRoutes,
  generator,
  invocationMode,
  mainFile,
  memory,
  name,
  path,
  priority,
  region,
  trafficRules,
  routes,
  runtime,
  runtimeVersion,
  runtimeAPIVersion,
  schedule,
  timeout,
  vcpu,
}: FunctionResult): ManifestFunction => {
  const manifestFunction: ManifestFunction = {
    bundler,
    displayName,
    generator,
    timeout,
    invocationMode,
    buildData: { bootstrapVersion, runtimeAPIVersion },
    mainFile,
    memory,
    name,
    priority,
    region,
    trafficRules,
    runtimeVersion,
    path: resolve(path),
    runtime,
    schedule,
    vcpu,
  }

  if (eventSubscriptions?.length) {
    manifestFunction.eventSubscriptions = eventSubscriptions
  }

  if (routes?.length !== 0) {
    manifestFunction.routes = routes
  }

  if (excludedRoutes && excludedRoutes.length !== 0) {
    manifestFunction.excludedRoutes = excludedRoutes
  }

  return manifestFunction
}
