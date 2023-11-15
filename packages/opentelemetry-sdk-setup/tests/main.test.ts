import { trace, TraceFlags } from '@opentelemetry/api'
import { Span } from '@opentelemetry/sdk-trace-base'
import { expect, test, beforeEach } from 'vitest'

import { startTracing, stopTracing } from '../src/sdk-setup.js'

beforeEach(async () => {
  await stopTracing()
})

const spanId = '6e0c63257de34c92'
// The sampler is deterministic, meaning that for a given traceId it will always produce a `SAMPLED` or a `NONE`
// consistently. More info in - https://opentelemetry.io/docs/specs/otel/trace/tracestate-probability-sampling/#consistent-probability-sampling
// As such given a specific traceId we can always expect a sampled or note sampled behaviour
const notSampledTraceId = 'd4cda95b652f4a1592b449d5929fda1b'
const sampledTraceId = 'e1819d7355971fd50456e41dbed71e58'

const testMatrix = [
  {
    description: 'when sampled, only include the SampleRate attribute by default',
    input: {
      traceId: sampledTraceId,
      sampleRate: 4,
    },
    expects: {
      parentSpanId: spanId,
      traceId: sampledTraceId,
      traceFlags: TraceFlags.SAMPLED,
      attributes: { SampleRate: 4 },
      checkResource: true,
    },
  },
  {
    description: 'when not sampled, attributes should be undefined and trace flags should be 0',
    input: {
      traceId: notSampledTraceId,
      sampleRate: 4,
    },
    expects: {
      // When trace isn't sampled, parent span id is undefined
      parentSpanId: undefined,
      traceId: notSampledTraceId,
      traceFlags: TraceFlags.NONE,
      attributes: undefined,
      // When trace isn't sampled, resource is undefined
      checkResource: false,
    },
  },
  {
    description: 'trace flags are ignored by the deterministic sampler',
    input: {
      traceId: sampledTraceId,
      traceFlags: TraceFlags.NONE,
      sampleRate: 4,
    },
    expects: {
      parentSpanId: spanId,
      traceId: sampledTraceId,
      traceFlags: TraceFlags.SAMPLED,
      attributes: { SampleRate: 4 },
      checkResource: true,
    },
  },
]

testMatrix.forEach((testCase) => {
  test(`Tracing spans - ${testCase.description}`, async (_) => {
    const { input, expects } = testCase
    const ctx = await startTracing(
      {
        preloadingEnabled: true,
        httpProtocol: 'http',
        host: 'localhost',
        port: 4127,
        sampleRate: input.sampleRate,
        traceId: input.traceId,
        traceFlags: input.traceFlags,
        parentSpanId: spanId,
        baggageFilePath: '',
        apiKey: '-',
        debug: false,
      },
      {
        name: 'mock-package',
        version: '1.0.0',
      },
    )

    const tracer = trace.getTracer('test')
    const span = tracer.startSpan('test', {}, ctx) as Span

    expect(span.spanContext().traceId).toEqual(expects.traceId)
    expect(span.spanContext().traceFlags).toEqual(expects.traceFlags)
    expect(span.parentSpanId).toEqual(expects.parentSpanId)
    expect(span.attributes).toStrictEqual(expects.attributes)
    if (expects.checkResource) {
      expect(span.resource.attributes).toContain({
        'service.name': 'mock-package',
        'service.version': '1.0.0',
      })
    }
  })
})

test('Tracing - trace id and resource definition', async (_) => {
  const ctx = await startTracing(
    {
      preloadingEnabled: true,
      httpProtocol: 'http',
      host: 'localhost',
      port: 4127,
      sampleRate: 1,
      baggageFilePath: '',
      apiKey: '-',
      debug: false,
    },
    {
      name: 'mock-package',
      version: '1.0.0',
    },
  )

  const tracer = trace.getTracer('test')
  const span = tracer.startSpan('test', {}, ctx) as Span

  expect(span.spanContext().traceId).not.empty
  expect(span.parentSpanId).toBeUndefined()
})
