import process from 'node:process'

import argsParser from 'yargs-parser'

import { startTracing, stopTracing, TracingOptions } from './sdk-setup.js'
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
  debug: false,
}

const args = argsParser(process.argv) as unknown as {
  /** _ holds args0 and args1 respectively, args1 will include the executable we're trying to run */
  _: [string, string]
  tracing: TracingOptions
}

// Apply the defaults making sure we're not tripped by falsy values
const options = Object.entries(defaultOptions)
  .map(([key, defaultValue]) => {
    if (args.tracing !== undefined && args.tracing[key] !== undefined) {
      return { [key]: args.tracing[key] }
    }
    return { [key]: defaultValue }
  })
  .reduce((acc, prop) => ({ ...acc, ...prop }), {}) as TracingOptions

const executablePath = args._[1]

findExecutablePackageJSON(executablePath).then((pkg) => startTracing(options, pkg))

//TODO handle `stopTracing` via `process` event emitter for all the other cases such as
//SIGINT and SIGTERM signals and potential uncaught exceptions
process.on('beforeExit', async () => await stopTracing())
