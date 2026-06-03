import { promises as fs } from 'fs'
import { resolve } from 'path'
import { arch, platform } from 'process'

import type { InvocationMode } from './function.js'
import type { TrafficRules } from './rate_limit.js'
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

export interface Manifest {
  functions: ManifestFunction[]
  system: {
    arch: string
    platform: string
  }
  timestamp: number
  version: number
}

const MANIFEST_VERSION = 1

export const createManifest = async ({ functions, path }: { functions: FunctionResult[]; path: string }) => {
  const formattedFunctions = functions.map((func) => formatFunctionForManifest(func))
  const payload: Manifest = {
    functions: formattedFunctions,
    system: { arch, platform },
    timestamp: Date.now(),
    version: MANIFEST_VERSION,
  }

  await fs.writeFile(path, JSON.stringify(payload))
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
