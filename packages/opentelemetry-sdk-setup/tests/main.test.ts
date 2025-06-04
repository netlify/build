import { writeFile, rm, mkdtemp } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tmpdir } from 'os'
import { join } from 'path'

import { trace, TraceFlags } from '@opentelemetry/api'
import { Span } from '@opentelemetry/sdk-trace-base'
import { expect, test, beforeEach, beforeAll, afterAll } from 'vitest'

import { startTracing, stopTracing } from '../src/sdk-setup.js'
import { findExecutablePackageJSON, loadBaggageFromFile } from '../src/util.js'

beforeEach(async () => {
  await stopTracing()
})

const spanId = '6e0c63257de34c92'
// The sampler is deterministic, meaning that for a given traceId it will always produce a `SAMPLED` or a `NONE`
// consistently. More info in - https://opentelemetry.io/docs/specs/otel/trace/tracestate-probability-sampling/#consistent-probability-sampling
// As such given a specific traceId we can always expect a sampled or note sampled behaviour
const notSampledTraceId = 'd4cda95b652f4a1592b449d5929fda1b'
const sampledTraceId = 'e1819d7355971fd50456e41dbed71e58'

const testSpanMatrix = [
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

test.each(testSpanMatrix)('Tracing spans - $description', async ({ input, expects }) => {
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
    expect(span.resource.attributes).toMatchObject({
      'service.name': 'mock-package',
      'service.version': '1.0.0',
    })
  }
})

test('Tracing - trace id and resource definition', async () => {
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

  expect(span.spanContext().traceId).toBeDefined()
  expect(span.parentSpanId).toBeUndefined()
})

test('Tracing - package.json extraction for executable', async () => {
  const pkgJson = await findExecutablePackageJSON(
    resolve('tests', 'fixtures', 'monorepo', 'packages', 'some-package', 'js-exec.js'),
  )

  expect(pkgJson.name).toEqual('some-package')
  expect(pkgJson.version).toEqual('2.0.0')
})

test('Tracing - package.json extraction for symlinked executable', async () => {
  const pkgJson = await findExecutablePackageJSON(
    resolve('tests', 'fixtures', 'package-with-symlink', 'package', 'js-exec.js'),
  )

  expect(pkgJson.name).toEqual('package-with-symlink')
  expect(pkgJson.version).toEqual('1.0.0')
})

const testMatrixBaggageFile = [
  {
    description: 'when baggageFilePath is undefined',
    input: {
      baggageFilePath: undefined,
      baggageFileContent: null,
    },
    expects: {
      somefield: undefined,
      foo: undefined,
    },
  },
  {
    description: 'when baggageFilePath is blank',
    input: {
      baggageFilePath: '',
      baggageFileContent: null,
    },
    expects: {
      somefield: undefined,
      foo: undefined,
    },
  },
  {
    description: 'when baggageFilePath is set but file is empty',
    input: {
      baggageFilePath: 'baggage.dump',
      baggageFileContent: '',
    },
    expects: {},
  },
  {
    description: 'when baggageFilePath is set and has content',
    input: {
      baggageFilePath: 'baggage.dump',
      baggageFileContent: 'somefield=value,foo=bar',
    },
    expects: {
      somefield: 'value',
      foo: 'bar',
    },
  },
]

let baggagePath: string
beforeAll(async () => {
  baggagePath = await mkdtemp(join(tmpdir(), 'baggage-path-'))
})

afterAll(async () => {
  await rm(baggagePath, { recursive: true })
})

test.each(testMatrixBaggageFile)('Tracing baggage loading - $description', async ({ input, expects }) => {
  // We only want to write the file if it's a non-empty string '', while we still want to test scenario
  let filePath = input.baggageFilePath
  if (typeof input.baggageFilePath === 'string' && input.baggageFilePath.length > 0) {
    filePath = `${baggagePath}/${input.baggageFilePath}`
    await writeFile(filePath, input?.baggageFileContent || '')
  }

  const attributes = await loadBaggageFromFile(filePath)

  // When there's no file we test that baggage is not set
  if (input.baggageFilePath === '' || input.baggageFilePath === undefined) {
    expect(attributes).toStrictEqual({})
    return
  }

  expect(attributes).toStrictEqual(expects)
})
