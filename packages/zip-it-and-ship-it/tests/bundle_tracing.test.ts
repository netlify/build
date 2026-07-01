import { SpanStatusCode, trace } from '@opentelemetry/api'
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { zipFixture } from './helpers/main.js'

// `function.bundle` spans are created via the global tracer, so capture them with an
// in-memory exporter. Reset between tests since the tracer provider is global state.
let exporter: InMemorySpanExporter

beforeEach(() => {
  trace.disable()
  exporter = new InMemorySpanExporter()
  const provider = new BasicTracerProvider()
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter))
  trace.setGlobalTracerProvider(provider)
})

afterEach(() => {
  trace.disable()
})

const getBundleSpans = () => exporter.getFinishedSpans().filter((span) => span.name === 'function.bundle')

describe('function.bundle spans', () => {
  test('emits a span with bundler and size attributes for a successful bundle', async () => {
    await zipFixture('simple')

    const spans = getBundleSpans()
    expect(spans).toHaveLength(1)

    const { attributes, status } = spans[0]
    expect(attributes['function.name']).toBe('function')
    expect(attributes['function.runtime']).toBe('js')
    expect(attributes['bundler.name']).toBe('zisi')
    expect(attributes['bundler.reason']).toBe('zisi-default')
    expect(attributes['bundler.errors_count']).toBe(0)
    expect(attributes['bundle.size_bytes']).toBeGreaterThan(0)
    expect(status.code).not.toBe(SpanStatusCode.ERROR)
  })

  test('records bundler.reason=flag-forced-nft when traceWithNft is enabled', async () => {
    await zipFixture('simple', { opts: { featureFlags: { traceWithNft: true } } })

    const [span] = getBundleSpans()
    expect(span.attributes['bundler.name']).toBe('nft')
    expect(span.attributes['bundler.reason']).toBe('flag-forced-nft')
  })

  test('records an exception and marks the span as errored when the bundler fails', async () => {
    await expect(
      zipFixture('node-syntax-error-cjs', { opts: { config: { '*': { nodeBundler: 'esbuild' } } } }),
    ).rejects.toThrow()

    const [span] = getBundleSpans()
    expect(span.status.code).toBe(SpanStatusCode.ERROR)
    expect(span.events.filter((event) => event.name === 'exception')).toHaveLength(1)
  })

  test('records an exception per bundler and marks the span as errored when esbuild and its zisi fallback both fail', async () => {
    await expect(
      zipFixture('node-syntax-error-cjs', { opts: { config: { '*': { nodeBundler: 'esbuild_zisi' } } } }),
    ).rejects.toThrow()

    const [span] = getBundleSpans()
    expect(span.status.code).toBe(SpanStatusCode.ERROR)
    expect(span.events.filter((event) => event.name === 'exception')).toHaveLength(2)
    // The two exception events should have different attributes because they are different exceptions (esbuild vs zisi)
    expect(span.events[0].attributes).not.toEqual(span.events[1].attributes)
  })

  test('records the esbuild exception but leaves the span un-errored when the zisi fallback succeeds', async () => {
    await zipFixture('node-syntax-error', { opts: { config: { '*': { nodeBundler: 'esbuild_zisi' } } } })

    const [span] = getBundleSpans()
    expect(span.status.code).not.toBe(SpanStatusCode.ERROR)
    expect(span.events.filter((event) => event.name === 'exception')).toHaveLength(1)
  })
})
