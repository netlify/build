import { context, Context, propagation, trace, SpanStatusCode } from '@opentelemetry/api'

/**
 * Sets attributes to be propagated across child spans under the current active context
 */
export const setMultiSpanAttributes = function (attributes: { [key: string]: string }) {
  const currentBaggage = propagation.getBaggage(context.active())
  // Create a baggage if there's none
  let baggage = currentBaggage === undefined ? propagation.createBaggage() : currentBaggage
  Object.entries(attributes).forEach(([key, value]) => {
    baggage = baggage.setEntry(key, { value })
  })

  return propagation.setBaggage(context.active(), baggage)
}

/**
 * Add error information to the current active span (if any). Optionally sets the provided attributes on the span too.
 */
export const addErrorToActiveSpan = function (error: Error, attributes?: { [key: string]: string }) {
  const span = trace.getActiveSpan()
  if (!span) return

  if (attributes !== undefined) {
    span.setAttributes(attributes)
  }

  span.recordException(error)
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  })
}

/**
 * Creates a specific event to the current active span (if any)
 */
export const addEventToActiveSpan = function (eventName: string, attributes?: { [key: string]: string }) {
  const span = trace.getActiveSpan()
  if (!span) return
  span.addEvent(eventName, attributes)
}

/**
 * Sets global context to be used when initialising our root span
 */
export const setGlobalContext = function (ctx: Context) {
  global['NETLIFY_GLOBAL_CONTEXT'] = ctx
}

/**
 * Gets the global context to be used when initialising our root span
 */
export const getGlobalContext = function (): Context {
  if (global['NETLIFY_GLOBAL_CONTEXT'] === undefined) {
    return context.active()
  }
  return global['NETLIFY_GLOBAL_CONTEXT']
}
