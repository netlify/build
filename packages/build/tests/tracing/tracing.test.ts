import { ROOT_CONTEXT, context, trace, SpanStatusCode, type Context, type ContextManager } from '@opentelemetry/api'
import { BasicTracerProvider, Span } from '@opentelemetry/sdk-trace-base'
import { afterAll, afterEach, assert, beforeAll, beforeEach, expect, test } from 'vitest'

import { addErrorInfo } from '../../lib/error/info.js'
import { addBuildErrorToActiveSpan } from '../../lib/tracing/main.js'

function createContextManager(activeContext: Context): ContextManager {
  const contextManager: ContextManager = {
    with: (_context, fn, thisArg, ...args) => fn.call(thisArg, ...args),
    bind: (_context, target) => target,
    active: () => activeContext,
    enable: () => contextManager,
    disable: () => contextManager,
  }
  return contextManager
}

beforeAll(() => {
  const tracerProvider = new BasicTracerProvider()
  const success = trace.setGlobalTracerProvider(tracerProvider)
  expect(success).toBe(true)
})

afterAll(() => {
  trace.disable()
})

beforeEach(() => {
  const tracer = trace.getTracer('test')
  const span = tracer.startSpan('my-span')
  const ctx = trace.setSpan(ROOT_CONTEXT, span)
  const success = context.setGlobalContextManager(createContextManager(ctx))
  expect(success).toBe(true)
})

afterEach(() => {
  context.disable()
})

test('addBuildErrorToActiveSpan - when error severity info', () => {
  const myError = new Error()
  addErrorInfo(myError, { type: 'failPlugin' })

  addBuildErrorToActiveSpan(myError)
  const span = trace.getActiveSpan()
  assert.instanceOf(span, Span)
  expect(span.status.code).toBe(SpanStatusCode.ERROR)
  // Severities are infered from the Error Type
  expect(span.attributes).toEqual({
    'build.error.location.type': 'buildFail',
    'build.error.severity': 'info',
    'build.error.type': 'failPlugin',
  })
})

test('addBuildErrorToActiveSpan - when error has no info', () => {
  const myError = new Error()
  addBuildErrorToActiveSpan(myError)

  const span = trace.getActiveSpan()
  assert.instanceOf(span, Span)
  expect(span.status.code).toBe(SpanStatusCode.ERROR)
  // If we have no custom build error Info nothing is added to the span attributes
  expect(span.attributes).toEqual({})
})

test('addBuildErrorToActiveSpan - noop when error severity none', () => {
  const myError = new Error()
  addErrorInfo(myError, { type: 'cancelBuild' })

  const span = trace.getActiveSpan()
  assert.instanceOf(span, Span)
  addBuildErrorToActiveSpan(myError)

  expect(span.attributes).toEqual({})
  expect(span.status.code).toBe(SpanStatusCode.UNSET)
})
