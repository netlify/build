import { FunctionArchive } from '../function.js'
import { RuntimeName } from '../runtimes/runtime.js'

import { removeUndefined } from './remove_undefined.js'
import type { ExtendedRoute, Route } from './routes.js'

export interface BuildData {
  bootstrapVersion?: string
  runtimeAPIVersion?: number
}

export type FunctionResult = Omit<FunctionArchive, 'runtime'> & {
  bootstrapVersion?: string
  buildData?: BuildData
  eventSubscriptions?: string[]
  memory?: number
  region?: string
  routes?: ExtendedRoute[]
  excludedRoutes?: Route[]
  runtime: RuntimeName
  schedule?: string
  runtimeAPIVersion?: number
  vcpu?: number
}

// Takes the result of zipping a function and formats it for output.
export const formatZipResult = (archive: FunctionArchive) => {
  const memory: number | undefined = archive.staticAnalysisResult?.config?.memory ?? archive?.config?.memory
  const vcpu: number | undefined = archive.staticAnalysisResult?.config?.vcpu ?? archive?.config?.vcpu
  const runtimeAPIVersion = archive.staticAnalysisResult?.runtimeAPIVersion

  // Mirror the `buildData` object that `manifest.ts` persists, so consumers
  // reading the in-memory result see the same shape as the manifest cache.
  // Only attach it when there's something to report (e.g. Node functions),
  // avoiding an empty `buildData: {}` on runtimes like Go and Rust.
  const buildData = removeUndefined({
    bootstrapVersion: archive.bootstrapVersion,
    runtimeAPIVersion,
  })

  const functionResult: FunctionResult = {
    ...archive,
    staticAnalysisResult: undefined,
    eventSubscriptions: archive.staticAnalysisResult?.eventSubscriptions,
    routes: archive.staticAnalysisResult?.routes,
    excludedRoutes: archive.staticAnalysisResult?.excludedRoutes,
    runtime: archive.runtime.name,
    memory,
    region: archive.staticAnalysisResult?.config?.region ?? archive?.config?.region,
    schedule: archive.staticAnalysisResult?.config?.schedule ?? archive?.config?.schedule,
    runtimeAPIVersion,
    buildData: Object.keys(buildData).length === 0 ? undefined : buildData,
    vcpu,
  }

  return removeUndefined(functionResult)
}
