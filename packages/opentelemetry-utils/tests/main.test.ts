import { context, trace, SpanStatusCode, ROOT_CONTEXT, propagation } from '@opentelemetry/api'
import type { Span } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { expect, test, beforeAll, afterAll } from 'vitest'

import {
  getGlobalContext,
  setGlobalContext,
  addAttributesToActiveSpan,
  addEventToActiveSpan,
  addErrorToActiveSpan,
  setMultiSpanAttributes,
} from '../src/index.js'

test('Sets the global context', async () => {
  const rootCtx = ROOT_CONTEXT
  const key = Symbol('some-key')
  const newCtx = rootCtx.setValue(key, 'my-custom-value')
  expect(getGlobalContext()).not.toBe(newCtx)
  setGlobalContext(newCtx)

  const globalCtx = getGlobalContext()
  expect(globalCtx).not.toBe(rootCtx)
  expect(globalCtx).toBe(newCtx)
  expect(globalCtx.getValue(key)).toEqual('my-custom-value')
})

let tracerProvider: NodeTracerProvider
beforeAll(async () => {
  tracerProvider = new NodeTracerProvider()
  tracerProvider.register()
})

afterAll(async () => {
  await tracerProvider.shutdown()
})

test('addEventToActiveSpan - adds an event to the current span', async () => {
  const tracer = trace.getTracer('default')
  const span = tracer.startSpan('my-span') as Span
  const ctx = trace.setSpan(context.active(), span)

  context.with(ctx, async () => {
    addEventToActiveSpan('someEvent', { foo: 'bar' })

    const firstEvent = span.events[0]
    expect(firstEvent.name).equal('someEvent')
    expect(firstEvent.attributes).toStrictEqual({ foo: 'bar' })
  })
})

test('addErrorToActiveSpan - no attributes are added', async () => {
  const tracer = trace.getTracer('default')
  const span = tracer.startSpan('my-span') as Span
  const ctx = trace.setSpan(context.active(), span)

  const myError = new Error()

  context.with(ctx, async () => {
    addErrorToActiveSpan(myError)

    expect(span.status.code).to.eq(SpanStatusCode.ERROR)
    expect(span.attributes).toStrictEqual({})

    const firstEvent = span.events[0]
    expect(firstEvent.name).equal('exception')
    expect(firstEvent.attributes?.['exception.stacktrace']).toBeDefined()
    expect(firstEvent.attributes?.['exception.type']).equal('Error')
  })
})

test('addErrorToActiveSpan - attributes are added', async () => {
  const tracer = trace.getTracer('default')
  const span = tracer.startSpan('my-span') as Span
  const ctx = trace.setSpan(context.active(), span)

  const myError = new Error()

  context.with(ctx, async () => {
    const attributes = {
      'build.error.location.type': 'buildFail',
      'build.error.severity': 'info',
      'build.error.type': 'failPlugin',
    }
    addErrorToActiveSpan(myError, attributes)

    expect(span.status.code).equal(SpanStatusCode.ERROR)
    // Severities are inferred from the Error Type
    expect(span.attributes).toStrictEqual(attributes)

    const firstEvent = span.events[0]
    expect(firstEvent.name).equal('exception')
    expect(firstEvent.attributes?.['exception.stacktrace']).toBeDefined()
    expect(firstEvent.attributes?.['exception.type']).equal('Error')
  })
})

test('addAttributesToActiveSpan - attributes are added', async () => {
  const tracer = trace.getTracer('default')
  const span = tracer.startSpan('my-span') as Span
  const ctx = trace.setSpan(context.active(), span)

  context.with(ctx, async () => {
    const attributes = {
      'build.test': 'something',
      'build.another-test': 'something-else',
    }
    addAttributesToActiveSpan(attributes)

    expect(span.attributes).toStrictEqual(attributes)
  })
})

test('addAttributesToActiveSpan - no attributes are added', async () => {
  const tracer = trace.getTracer('default')
  const span = tracer.startSpan('my-span') as Span
  const ctx = trace.setSpan(context.active(), span)

  context.with(ctx, async () => {
    const attributes = {}
    expect(() => addAttributesToActiveSpan()).not.toThrowError()

    expect(span.attributes).toStrictEqual(attributes)
  })
})

test('addAttributesToActiveSpan - does not throw without active span', async () => {
  expect(() => addAttributesToActiveSpan()).not.toThrowError()
})

test('setMultiSpanAttributes - baggage is populated', async () => {
  const ctx = setMultiSpanAttributes({ some: 'test', foo: 'bar' })
  const baggage = propagation.getBaggage(ctx)
  expect(baggage?.getEntry('some')?.value).equal('test')
  expect(baggage?.getEntry('foo')?.value).equal('bar')
})
