import { HoneycombSDK } from '@honeycombio/opentelemetry-node'
import { context, trace, propagation } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { NodeSDK } from '@opentelemetry/sdk-node'

import type { TracingOptions } from '../core/types.js'
import { ROOT_PACKAGE_JSON } from '../utils/json.js'

export const startTracing = function (options: TracingOptions) {
  if (!options.enabled) return

  const sdk: NodeSDK = new HoneycombSDK({
    serviceName: ROOT_PACKAGE_JSON.name,
    endpoint: `http://${options.host}:${options.port}`,
    instrumentations: [
      getNodeAutoInstrumentations({
        // disabling fs autoinstrumentation since it can be noisy
        // and expensive during startup
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
        },
      }),
    ],
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
}

/** Sets attributes to be propagated across child spans under the current context */
export const setMultiSpanAttributes = function (attributes: { [key: string]: string }) {
  const currentBaggage = propagation.getBaggage(context.active())
  const baggage = currentBaggage === undefined ? propagation.createBaggage() : currentBaggage
  Object.entries(attributes).forEach((entry) => {
    baggage.setEntry(entry[0], { value: entry[1] })
  })
  return propagation.setBaggage(context.active(), baggage)
}

export type RootExecutionAttributes = {
  'build.id': string
  'site.id': string
  'deploy.id': string
  'deploy.context': string
}

export const setRootExecutionAttributes = function (attributes: RootExecutionAttributes) {
  setRootExecutionAttributes(attributes)
}
