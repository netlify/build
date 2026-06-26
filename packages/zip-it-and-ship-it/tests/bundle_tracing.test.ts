import { SpanStatusCode, trace } from '@opentelemetry/api'
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { zipNode } from './helpers/main.js'

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
    await zipNode('simple')

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
    await zipNode('simple', { opts: { featureFlags: { traceWithNft: true } } })

    const [span] = getBundleSpans()
    expect(span.attributes['bundler.name']).toBe('nft')
    expect(span.attributes['bundler.reason']).toBe('flag-forced-nft')
  })

  test('records an exception event when esbuild fails and falls back to zisi', async () => {
    // `esbuild_zisi` tries esbuild first; the fixture is invalid for esbuild, so the
    // exception is recorded on the span before recovering with zisi.
    await zipNode('node-syntax-error', { opts: { config: { '*': { nodeBundler: 'esbuild_zisi' } } } }).catch(() => {
      // If zisi also fails the call rejects, but the esbuild exception is still recorded.
    })

    const [span] = getBundleSpans()
    expect(span.events.some((event) => event.name === 'exception')).toBe(true)
  })
})
