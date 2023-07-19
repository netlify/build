import { trace, TraceFlags } from '@opentelemetry/api'
import { getBaggage } from '@opentelemetry/api/build/src/baggage/context-helpers.js'
import test from 'ava'

import { setMultiSpanAttributes, startTracing, stopTracing } from '../../lib/tracing/main.js'

test('Tracing set multi span attributes', async (t) => {
  const ctx = setMultiSpanAttributes({ some: 'test', foo: 'bar' })
  const baggage = getBaggage(ctx)
  t.is(baggage.getEntry('some').value, 'test')
  t.is(baggage.getEntry('foo').value, 'bar')
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
      traceId: sampledTraceId,
      traceFlags: TraceFlags.SAMPLED,
      attributes: { SampleRate: 4 },
    },
  },
  {
    description: 'when not sampled, attributes should be undefined and trace flags should be 0',
    input: {
      traceId: notSampledTraceId,
      sampleRate: 4,
    },
    expects: {
      traceId: notSampledTraceId,
      traceFlags: TraceFlags.NONE,
      attributes: undefined,
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
      traceId: sampledTraceId,
      traceFlags: TraceFlags.SAMPLED,
      attributes: { SampleRate: 4 },
    },
  },
]

test.beforeEach('cleanup tracing', async () => {
  await stopTracing()
})

testMatrix.forEach((testCase) => {
  const noopLogger = () => {}

  // Tests need to run serially since the tracing context is global state
  test.serial(`Tracing spans - ${testCase.description}`, async (t) => {
    const { input, expects } = testCase
    const ctx = startTracing(
      {
        enabled: true,
        httpProtocol: 'http',
        host: 'localhost',
        port: 4127,
        sampleRate: input.sampleRate,
        traceId: input.traceId,
        traceFlags: input.traceFlags,
        parentSpanId: spanId,
      },
      noopLogger,
    )

    const tracer = trace.getTracer('test')
    const span = tracer.startSpan('test', {}, ctx)

    t.is(span.spanContext().traceId, expects.traceId)
    t.is(span.spanContext().traceFlags, expects.traceFlags)
    t.deepEqual(span.attributes, expects.attributes)
  })
})
