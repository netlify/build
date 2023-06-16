import { HoneycombSDK } from '@honeycombio/opentelemetry-node'
import { context, trace, propagation, SpanStatusCode } from '@opentelemetry/api'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { NodeSDK } from '@opentelemetry/sdk-node'

import type { TracingOptions } from '../core/types.js'
import { ROOT_PACKAGE_JSON } from '../utils/json.js'

export const startTracing = function (options: TracingOptions) {
  if (!options.enabled) return

  const sdk: NodeSDK = new HoneycombSDK({
    serviceName: ROOT_PACKAGE_JSON.name,
    endpoint: `http://${options.host}:${options.port}`,
    instrumentations: [new HttpInstrumentation()],
  })

  sdk.start()

  // Sets the current trace ID and span ID based on the options received
  // this is used a way to propagate trace context from Buildbot
  trace.setSpanContext(context.active(), {
    traceId: options.traceId,
    spanId: options.parentSpanId,
    traceFlags: options.traceFlags,
    isRemote: true,
  })

  return sdk
}

/** Sets attributes to be propagated across child spans under the current context */
export const setMultiSpanAttributes = function (attributes: { [key: string]: string }) {
  const currentBaggage = propagation.getBaggage(context.active())
  let baggage = currentBaggage === undefined ? propagation.createBaggage() : currentBaggage
  Object.entries(attributes).forEach((entry) => {
    baggage = baggage.setEntry(entry[0], { value: entry[1] })
  })
  return propagation.setBaggage(context.active(), baggage)
}

/** Add error information to the current active span (if any) */
export const addErrorToActiveSpan = function (error: Error) {
  const span = trace.getActiveSpan()
  if (!span) return

  span.recordException(error)
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  })
}

/** Attributes used for the root span of our execution */
export type RootExecutionAttributes = {
  'build.id': string
  'site.id': string
  'deploy.id': string
  'deploy.context': string
}

/** Attributes used for the execution of each build step  */
export type StepExecutionAttributes = {
  'build.execution.step.name': string
  'build.execution.step.description': string
  'build.execution.step.package_name': string
  'build.execution.step.id': string
  'build.execution.step.loaded_from': string
  'build.execution.step.origin': string
  'build.execution.step.event': string
}
