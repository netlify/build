import process from 'node:process'

import argsParser from 'yargs-parser'

import { startTracing, TracingOptions } from './sdk-setup.js'
import { findExecutablePackageJSON } from './util.js'

const DEFAULT_OTEL_TRACING_PORT = 4317
const DEFAULT_OTEL_ENDPOINT_PROTOCOL = 'http'

const defaultOptions: TracingOptions = {
  preloadingEnabled: false,
  httpProtocol: DEFAULT_OTEL_ENDPOINT_PROTOCOL,
  host: 'locahost',
  port: DEFAULT_OTEL_TRACING_PORT,
  sampleRate: 1,
  baggageFilePath: '',
  apiKey: '-',
  parentSpanId: '',
  traceId: '',
  traceFlags: 0,
  debug: false,
}

const args = argsParser(process.argv) as unknown as {
  /** _ holds args0 and args1 respectively, args1 will include the executable we're trying to run */
  _: [string, string]
  tracing: TracingOptions
}

const options = {
  ...args.tracing,
  ...defaultOptions,
  debug: args.tracing.debug === undefined ? defaultOptions.debug : args.tracing.debug,
  preloadingEnabled:
    args.tracing.preloadingEnabled === undefined ? defaultOptions.preloadingEnabled : args.tracing.preloadingEnabled,
}
const executablePath = args._[1]

findExecutablePackageJSON(executablePath).then((pkg) => startTracing(options, pkg))

//TODO handle `stopTracing` via `process` event emitter
