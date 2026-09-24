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

export interface Manifest {
  functions: ManifestFunction[]
  server?: ManifestServer
  system: {
    arch: string
    platform: string
  }
  timestamp: number
  version: number
}

const MANIFEST_VERSION = 1

export const createManifest = async ({
  functions,
  path,
  server,
}: {
  functions: FunctionResult[]
  path: string
  server?: ServerResult
}) => {
  const payload: Manifest = {
    functions: functions.map((func) => formatFunctionForManifest(func)),
    server: server && formatServerForManifest(server),
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
