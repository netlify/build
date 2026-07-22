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
    buildData: {
      bootstrapVersion: archive.bootstrapVersion,
      runtimeAPIVersion,
    },
    vcpu,
  }

  return removeUndefined(functionResult)
}
