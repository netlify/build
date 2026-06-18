import { setMultiSpanAttributes } from '@netlify/opentelemetry-utils'
import { DiagLogLevel, TraceFlags, context, diag, trace } from '@opentelemetry/api'
import { ALLOW_ALL_BAGGAGE_KEYS, BaggageSpanProcessor } from '@opentelemetry/baggage-span-processor'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchSpanProcessor, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import type { PackageJson } from 'read-package-up'

import { getDiagLogger, loadBaggageFromFile } from './util.js'

export type TracingOptions = {
  /** This is a temporary property to signal preloading is enabled, can be replaced with `enabled` once we retire build's internal sdk setup */
  preloadingEnabled: boolean
  httpProtocol: string
  host: string
  port: number
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

let sdk: NodeTracerProvider | undefined

/** Starts the tracing SDK, if there's already a tracing service this will be a no-op */
export const startTracing = async function (options: TracingOptions, packageJson: PackageJson) {
  if (!options.preloadingEnabled) return
  if (sdk) return

  const serviceName = process.env.OTEL_SERVICE_NAME || packageJson.name

  // `sampleRate` is a 1-in-N rate, whereas the OTEL sampler takes a 0..1 ratio. Both are
  // deterministic on trace ID, so sibling processes sharing a trace sample consistently.
  const sampleRatio = options.sampleRate > 0 ? 1 / options.sampleRate : 1

  sdk = new NodeTracerProvider({
    // We don't run any resource detectors so that we fully control the attributes we export
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: process.env.OTEL_SERVICE_VERSION || packageJson.version,
    }),
    // Deliberately not wrapped in a ParentBasedSampler: we always re-derive the decision from the
    // trace ID rather than inheriting the parent's sampled flag. Since the decision is deterministic
    // per trace ID, every process in a trace still agrees. Inheriting instead would drop all spans
    // whenever an incoming parent context is unsampled.
    sampler: new TraceIdRatioBasedSampler(sampleRatio),
    spanProcessors: [
      // Copies baggage entries (build.id, site.id, deploy.id, ...) onto every span as attributes
      new BaggageSpanProcessor(ALLOW_ALL_BAGGAGE_KEYS),
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url: `${options.httpProtocol}://${options.host}:${options.port}` }),
      ),
    ],
  })

  // Set the diagnostics logger to our system logger. We also need to suppress the override msg
  // in case there's a default console logger already registered (it would log a msg to it)
  diag.setLogger(getDiagLogger(options.debug, options.systemLogFile), {
    logLevel: options.debug ? DiagLogLevel.DEBUG : DiagLogLevel.INFO,
    suppressOverrideMessage: true,
  })

  // Registers as the global tracer provider, so instrumented code reaches it via `@opentelemetry/api`
  sdk.register()

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
