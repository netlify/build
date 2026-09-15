#!/usr/bin/env node

import { promises as fs } from 'fs'
import { dirname } from 'path'
import process from 'process'

import { context } from '@opentelemetry/api'
import fastSafeStringify from 'fast-safe-stringify'

import { isUserError } from '../error.js'
import { resolveConfig } from '../main.js'

import { parseFlags } from './flags.js'

// CLI entry point
const runCli = async function () {
  try {
    const {
      stable,
      output = DEFAULT_OUTPUT,
      traceId,
      traceParentSpanId,
      traceFlags,
      tracingBaggageFilePath,
      ...flags
    } = parseFlags()
    const rootCtx = await setupTracing({ traceId, traceParentSpanId, traceFlags, tracingBaggageFilePath })
    const result = await context.with(rootCtx, () => resolveConfig(flags))
    await handleCliSuccess(result, stable, output)
  } catch (error) {
    handleCliError(error)
  } finally {
    await teardownTracing()
  }
}

let stopTracing

const DEFAULT_OTEL_TRACING_PORT = 4317
const DEFAULT_OTEL_ENDPOINT_PROTOCOL = 'http'

// Buildbot passes trace context (trace id, parent span id, trace flags, baggage) as CLI flags
// so this process's spans get stitched into the same trace. Field names here differ from
// Buildbot's flag names, so we map them onto what `opentelemetry-sdk-setup` expects.
// `@netlify/opentelemetry-sdk-setup` is an optional dependency, so this is a no-op when it
// isn't installed or no trace context was passed.
const setupTracing = async function ({ traceId, traceParentSpanId, traceFlags, tracingBaggageFilePath }) {
  try {
    const { startTracing, stopTracing: stopTracingFn } = await import('@netlify/opentelemetry-sdk-setup')
    stopTracing = stopTracingFn
    const packageJson = JSON.parse(await fs.readFile(new URL('../../package.json', import.meta.url), 'utf8'))
    const rootCtx = await startTracing(
      {
        preloadingEnabled: Boolean(traceId),
        httpProtocol: DEFAULT_OTEL_ENDPOINT_PROTOCOL,
        host: 'localhost',
        port: DEFAULT_OTEL_TRACING_PORT,
        sampleRate: 1,
        apiKey: '-',
        debug: false,
        traceId,
        parentSpanId: traceParentSpanId,
        traceFlags,
        baggageFilePath: tracingBaggageFilePath,
      },
      packageJson,
    )
    return rootCtx ?? context.active()
  } catch {
    return context.active()
  }
}

const teardownTracing = async function () {
  if (stopTracing) {
    await stopTracing()
  }
}

const DEFAULT_OUTPUT = '-'

// The result is output as JSON on success (exit code 0)
const handleCliSuccess = async function (result, stable, output) {
  const resultA = serializeApi(result)
  const resultB = Object.fromEntries(Object.entries(resultA).filter(([key]) => !SECRET_PROPERTIES.includes(key)))
  const stringifyFunc = stable ? fastSafeStringify.stableStringify : JSON.stringify
  const resultJson = stringifyFunc(resultB, null, 2)
  await outputResult(resultJson, output)
  process.exitCode = 0
}

const outputResult = async function (resultJson, output) {
  if (output === '-') {
    console.log(resultJson)
    return
  }

  await fs.mkdir(dirname(output), { recursive: true })
  await fs.writeFile(output, resultJson)
}

// `api` is not JSON-serializable, so we remove it
// We still indicate it as a boolean
const serializeApi = function ({ api, ...result }) {
  if (api === undefined) {
    return result
  }

  return { ...result, hasApi: true }
}

const SECRET_PROPERTIES = ['token']

const handleCliError = function (error) {
  // Errors caused by users do not show stack traces and have exit code 1
  if (isUserError(error)) {
    console.error(error.message)
    process.exitCode = 1
    return
  }

  // Internal errors / bugs have exit code 2
  console.error(error.stack)
  process.exitCode = 2
}

runCli()
