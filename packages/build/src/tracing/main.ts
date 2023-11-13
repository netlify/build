import { readFileSync } from 'node:fs'

import { HoneycombSDK } from '@honeycombio/opentelemetry-node'
import { context, trace, propagation, SpanStatusCode, diag, DiagLogLevel, DiagLogger } from '@opentelemetry/api'
import { parseKeyPairsIntoRecord } from '@opentelemetry/core/build/src/baggage/utils.js'
import { NodeSDK } from '@opentelemetry/sdk-node'

import type { TracingOptions } from '../core/types.js'
import { isBuildError } from '../error/info.js'
import { parseErrorInfo } from '../error/parse/parse.js'
import { buildErrorToTracingAttributes } from '../error/types.js'
import { ROOT_PACKAGE_JSON } from '../utils/json.js'

let sdk: NodeSDK | undefined

/** Given a simple logging function return a `DiagLogger`. Used to setup our system logger as the diag logger.*/
const getOtelLogger = function (logger: (...args: any[]) => void): DiagLogger {
  const otelLogger = (...args: any[]) => {
    // Debug log msgs can be an array of 1 or 2 elements with the second element being an array fo multiple elements
    const msgs = args.flat(1)
    logger('[otel-traces]', ...msgs)
  }
  return {
    debug: otelLogger,
    info: otelLogger,
    error: otelLogger,
    verbose: otelLogger,
    warn: otelLogger,
  }
}

/** Starts the tracing SDK, if there's already a tracing service this will be a no-op */
export const startTracing = function (options: TracingOptions, logger: (...args: any[]) => void) {
  if (!options.enabled) return
  if (sdk) return

  sdk = new HoneycombSDK({
    serviceName: ROOT_PACKAGE_JSON.name,
    protocol: 'grpc',
    apiKey: options.apiKey,
    endpoint: `${options.httpProtocol}://${options.host}:${options.port}`,
    sampleRate: options.sampleRate,
    // Turn off auto resource detection so that we fully control the attributes we export
    autoDetectResources: false,
  })

  // Set the diagnostics logger to our system logger. We also need to suppress the override msg
  // in case there's a default console logger already registered (it would log a msg to it)
  diag.setLogger(getOtelLogger(logger), { logLevel: DiagLogLevel.INFO, suppressOverrideMessage: true })

  sdk.start()

  // Loads the contents of the passed baggageFilePath into the baggage
  const baggageCtx = loadBaggageFromFile(options.baggageFilePath)

  // Sets the current trace ID and span ID based on the options received
  // this is used as a way to propagate trace context from Buildbot
  const ctx = trace.setSpanContext(baggageCtx, {
    traceId: options.traceId,
    spanId: options.parentSpanId,
    traceFlags: options.traceFlags,
    isRemote: true,
  })

  return ctx
}

/** Stops the tracing service if there's one running. This will flush any ongoing events */
export const stopTracing = async function () {
  if (!sdk) return
  try {
    // The shutdown method might return an error if we fail to flush the traces
    // We handle it and use our diagnostics logger
    await sdk.shutdown()
    sdk = undefined
  } catch (e) {
    diag.error(e)
  }
}

/** Sets attributes to be propagated across child spans under the current active context */
export const setMultiSpanAttributes = function (attributes: { [key: string]: string }) {
  const currentBaggage = propagation.getBaggage(context.active())
  // Create a baggage if there's none
  let baggage = currentBaggage === undefined ? propagation.createBaggage() : currentBaggage
  Object.entries(attributes).forEach(([key, value]) => {
    baggage = baggage.setEntry(key, { value })
  })

  return propagation.setBaggage(context.active(), baggage)
}

/** Add error information to the current active span (if any) */
export const addErrorToActiveSpan = function (error: Error) {
  const span = trace.getActiveSpan()
  if (!span) return
  if (isBuildError(error)) {
    const buildError = parseErrorInfo(error)
    if (buildError.severity == 'none') return
    span.setAttributes(buildErrorToTracingAttributes(buildError))
  }

  span.recordException(error)
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  })
}

export const addEventToActiveSpan = function (eventName: string, attributes?: { [key: string]: string }) {
  const span = trace.getActiveSpan()
  if (!span) return
  span.addEvent(eventName, attributes)
}

//** Loads the baggage attributes from a baggabe file which follows W3C Baggage specification */
export const loadBaggageFromFile = function (baggageFilePath: string) {
  if (baggageFilePath.length === 0) {
    diag.warn('Empty baggage file path provided, no context loaded')
    return context.active()
  }
  let baggageString: string
  try {
    baggageString = readFileSync(baggageFilePath, 'utf-8')
  } catch (error) {
    diag.error(error)
    return context.active()
  }
  const parsedBaggage = parseKeyPairsIntoRecord(baggageString)
  return setMultiSpanAttributes(parsedBaggage)
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
