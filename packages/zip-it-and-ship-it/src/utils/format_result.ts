import { FunctionArchive } from '../function.js'
import { RuntimeName } from '../runtimes/runtime.js'

import { removeUndefined } from './remove_undefined.js'
import type { ExtendedRoute, Route } from './routes.js'

export type FunctionResult = Omit<FunctionArchive, 'runtime'> & {
  bootstrapVersion?: string
  eventSubscriptions?: string[]
  memory?: number
  region?: string
  routes?: ExtendedRoute[]
  excludedRoutes?: Route[]
  runtime: RuntimeName
  schedule?: string
  runtimeAPIVersion?: number
}

// Takes the result of zipping a function and formats it for output.
export const formatZipResult = (archive: FunctionArchive) => {
  const memory: number | undefined = archive.staticAnalysisResult?.config?.memory ?? archive?.config?.memory

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
    runtimeAPIVersion: archive.staticAnalysisResult?.runtimeAPIVersion,
  }

  return removeUndefined(functionResult)
}
