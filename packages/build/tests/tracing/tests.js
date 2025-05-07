import { ROOT_CONTEXT, context, trace, SpanStatusCode } from '@opentelemetry/api'
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base'
import test from 'ava'

import { addErrorInfo } from '../../lib/error/info.js'
import { addBuildErrorToActiveSpan } from '../../lib/tracing/main.js'

function createContextManager(activeContext) {
  return {
    with: (_, fn, thisArg, ...args) => fn.call(thisArg, ...args),
    active: () => activeContext,
    enable: () => activeContext,
    disable: () => activeContext,
  }
}

test.before((t) => {
  const tracerProvider = new BasicTracerProvider()
  const success = trace.setGlobalTracerProvider(tracerProvider)
  t.true(success)
})

test.after(() => {
  trace.disable()
})

test.beforeEach((t) => {
  const tracer = trace.getTracer('test')
  const span = tracer.startSpan('my-span')
  const ctx = trace.setSpan(ROOT_CONTEXT, span)
  const success = context.setGlobalContextManager(createContextManager(ctx))
  t.true(success)
})

test.afterEach(() => {
  context.disable()
})

test.serial('addBuildErrorToActiveSpan - when error severity info', async (t) => {
  const myError = new Error()
  addErrorInfo(myError, { type: 'failPlugin' })

  addBuildErrorToActiveSpan(myError)
  const span = trace.getActiveSpan()
  t.is(span.status.code, SpanStatusCode.ERROR)
  // Severities are infered from the Error Type
  t.deepEqual(span.attributes, {
    'build.error.location.type': 'buildFail',
    'build.error.severity': 'info',
    'build.error.type': 'failPlugin',
  })
})

test.serial('addBuildErrorToActiveSpan - when error has no info', async (t) => {
  const myError = new Error()
  addBuildErrorToActiveSpan(myError)

  const span = trace.getActiveSpan()
  t.is(span.status.code, SpanStatusCode.ERROR)
  // If we have no custom build error Info nothing is added to the span attributes
  t.deepEqual(span.attributes, {})
})

test.serial('addBuildErrorToActiveSpan - noop when error severity none', async (t) => {
  const myError = new Error()
  addErrorInfo(myError, { type: 'cancelBuild' })

  const span = trace.getActiveSpan()
  addBuildErrorToActiveSpan(myError)

  t.deepEqual(span.attributes, {})
  t.is(span.status.code, SpanStatusCode.UNSET)
})
