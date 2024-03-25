import { HoneycombSDK } from '@honeycombio/opentelemetry-node'
import { setMultiSpanAttributes } from '@netlify/opentelemetry-utils'
import { DiagLogLevel, TraceFlags, context, diag, trace } from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import type { PackageJson } from 'read-pkg-up'

import { getDiagLogger, loadBaggageFromFile } from './util.js'

export type TracingOptions = {
  /** This is a temporary property to signal preloading is enabled, can be replaced with `enabled` once we retire build's internal sdk setup */
  preloadingEnabled: boolean
  httpProtocol: string
  host: string
  port: number
  /** API Key used for a dedicated trace provider */
  apiKey: string
  /** Sample rate being used for this trace, this allows for consistent probability sampling */
  sampleRate: number
  /** Properties of the root span and trace id used to stitch context */
  traceId?: string
  traceFlags?: number
  parentSpanId?: string
  baggageFilePath?: string
  /** Debug mode enabled - logs to stdout */
  debug: boolean
  /** System log file descriptor */
  systemLogFile?: number
}

let sdk: HoneycombSDK | undefined

/** Starts the tracing SDK, if there's already a tracing service this will be a no-op */
export const startTracing = async function (options: TracingOptions, packageJson: PackageJson) {
  if (!options.preloadingEnabled) return
  if (sdk) return

  const serviceName = process.env.OTEL_SERVICE_NAME || packageJson.name

  sdk = new HoneycombSDK({
    resource: new Resource({
      SEMRESATTRS_SERVICE_NAME: serviceName,
      SEMRESATTRS_SERVICE_VERSION: process.env.OTEL_SERVICE_VERSION || packageJson.version,
    }),
    serviceName,
    protocol: 'grpc',
    apiKey: options.apiKey,
    endpoint: `${options.httpProtocol}://${options.host}:${options.port}`,
    sampleRate: options.sampleRate,
    // Turn off auto resource detection so that we fully control the attributes we export
    autoDetectResources: false,
  })

  // Set the diagnostics logger to our system logger. We also need to suppress the override msg
  // in case there's a default console logger already registered (it would log a msg to it)
  diag.setLogger(getDiagLogger(options.debug, options.systemLogFile), {
    logLevel: options.debug ? DiagLogLevel.DEBUG : DiagLogLevel.INFO,
    suppressOverrideMessage: true,
  })

  sdk.start()

  // Loads the contents of the passed baggageFilePath into the baggage
  const baggageAttributes = await loadBaggageFromFile(options.baggageFilePath)
  const baggageCtx = setMultiSpanAttributes(baggageAttributes)

  const traceFlags = options.traceFlags !== undefined ? options.traceFlags : TraceFlags.NONE
  // Sets the current trace ID and span ID based on the options received
  // this is used as a way to propagate trace context from other processes such as Buildbot
  if (options.traceId !== undefined && options.parentSpanId !== undefined) {
    return trace.setSpanContext(baggageCtx, {
      traceId: options.traceId,
      spanId: options.parentSpanId,
      traceFlags: traceFlags,
      isRemote: true,
    })
  }

  return context.active()
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
