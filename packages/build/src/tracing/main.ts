import { context, trace, propagation, SpanStatusCode, diag, DiagLogLevel, DiagLogger } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { NodeSDK } from '@opentelemetry/sdk-node'

import type { TracingOptions } from '../core/types.js'
import { ROOT_PACKAGE_JSON } from '../utils/json.js'

let sdk: NodeSDK

/** Given a simple logging function return a `DiagLogger`. Used to setup our system logger as the diag logger.*/
const getOtelLogger = function (logger: (...args: any[]) => void): DiagLogger {
  const otelLogger = (...args: any[]) => logger('[otel-traces]', ...args)
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

  const traceExporter = new OTLPTraceExporter({
    url: `http://${options.host}:${options.port}`,
  })

  sdk = new NodeSDK({
    serviceName: ROOT_PACKAGE_JSON.name,
    traceExporter,
    instrumentations: [new HttpInstrumentation()],
  })

  // Set the diagnostics logger to our system logger. We also need to suppress the override msg
  // in case there's a default console logger already registered (it would log a msg to it)
  diag.setLogger(getOtelLogger(logger), { logLevel: DiagLogLevel.INFO, suppressOverrideMessage: true })

  sdk.start()

  // Sets the current trace ID and span ID based on the options received
  // this is used as a way to propagate trace context from Buildbot
  trace.setSpanContext(context.active(), {
    traceId: options.traceId,
    spanId: options.parentSpanId,
    traceFlags: options.traceFlags,
    isRemote: true,
  })
}

/** Stops the tracing service if there's one running. This will flush any ongoing events */
export const stopTracing = async function () {
  if (!sdk) return
  try {
    // The shutdown method might return an error if we fail to flush the traces
    // We handle it and use our diagnostics logger
    await sdk.shutdown()
  } catch (e) {
    diag.error(e)
  }
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
