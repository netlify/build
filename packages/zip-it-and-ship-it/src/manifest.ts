import { promises as fs } from 'fs'
import { resolve } from 'path'
import { arch, platform } from 'process'

import type { FeatureFlags } from './feature_flags.js'
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
  name: string
  path: string
  priority?: number
  routes?: ExtendedRoute[]
  runtime: string
  runtimeVersion?: string
  schedule?: string
  timeout?: number
  trafficRules?: TrafficRules
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

export const createManifest = async ({
  functions,
  featureFlags = {},
  path,
}: {
  functions: FunctionResult[]
  featureFlags?: FeatureFlags
  path: string
}) => {
  const formattedFunctions = functions.map((func) => formatFunctionForManifest(func, featureFlags))
  const payload: Manifest = {
    functions: formattedFunctions,
    system: { arch, platform },
    timestamp: Date.now(),
    version: MANIFEST_VERSION,
  }

  await fs.writeFile(path, JSON.stringify(payload))
}

const formatFunctionForManifest = (
  {
    bootstrapVersion,
    bundler,
    displayName,
    eventSubscriptions,
    excludedRoutes,
    generator,
    invocationMode,
    mainFile,
    name,
    path,
    priority,
    trafficRules,
    routes,
    runtime,
    runtimeVersion,
    runtimeAPIVersion,
    schedule,
    timeout,
  }: FunctionResult,
  featureFlags: FeatureFlags,
): ManifestFunction => {
  const manifestFunction: ManifestFunction = {
    bundler,
    displayName,
    generator,
    timeout,
    invocationMode,
    buildData: { bootstrapVersion, runtimeAPIVersion },
    mainFile,
    name,
    priority,
    trafficRules,
    runtimeVersion,
    path: resolve(path),
    runtime,
    schedule,
  }

  if (featureFlags.zisi_event_subscriptions && eventSubscriptions?.length) {
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
