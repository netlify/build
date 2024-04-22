import { addErrorToActiveSpan } from '@netlify/opentelemetry-utils'
import type { Attributes } from '@opentelemetry/api'

import { isBuildError } from '../error/info.js'
import { parseErrorInfo } from '../error/parse/parse.js'
import { buildErrorToTracingAttributes } from '../error/types.js'

/** Add error information to the current active span (if any) */
export const addBuildErrorToActiveSpan = function (error: Error) {
  let buildErrorAttributes: Attributes | undefined
  if (isBuildError(error)) {
    const buildError = parseErrorInfo(error)
    if (buildError.severity == 'none') return
    buildErrorAttributes = buildErrorToTracingAttributes(buildError)
  }

  addErrorToActiveSpan(error, buildErrorAttributes)
}

/** Attributes used for the root span of our execution */
export type RootExecutionAttributes = {
  'build.id': string
  'site.id': string
  'deploy.id': string
  'deploy.context': string
  // We need to respect the current format used by Buildbot
  'build.info.primary_framework': string
}

/** Attributes used for the execution of each build step  */
export type StepExecutionAttributes = {
  'build.execution.step.name': string
  'build.execution.step.package_name': string
  'build.execution.step.package_path': string
  'build.execution.step.build_dir': string
  'build.execution.step.id': string
  'build.execution.step.loaded_from': string
  'build.execution.step.origin': string
  'build.execution.step.event': string
}
