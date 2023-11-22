import process from 'node:process'

import { diag } from '@opentelemetry/api'
import argsParser from 'yargs-parser'

import { startTracing, stopTracing, TracingOptions } from './sdk-setup.js'
import { findExecutablePackageJSON, setGlobalContext } from './util.js'

const DEFAULT_OTEL_TRACING_PORT = 4317
const DEFAULT_OTEL_ENDPOINT_PROTOCOL = 'http'

const defaultOptions: TracingOptions = {
  preloadingEnabled: false,
  httpProtocol: DEFAULT_OTEL_ENDPOINT_PROTOCOL,
  host: 'locahost',
  port: DEFAULT_OTEL_TRACING_PORT,
  // defaults to always sample
  sampleRate: 1,
  baggageFilePath: '',
  // tracing.apiKey defaults to '-' else we'll get warning logs if not using
  // honeycomb directly - https://github.com/honeycombio/honeycomb-opentelemetry-node/issues/201
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

const run = async function () {
  try {
    // If tracing is disabled just skip the initialisation altogether
    if (!options.preloadingEnabled) return
    const pkg = await findExecutablePackageJSON(executablePath)
    const rootCtx = await startTracing(options, pkg)
    if (rootCtx !== undefined) {
      diag.debug('Setting global root context imported from bagage file')
      setGlobalContext(rootCtx)
    } else {
      diag.debug('Root context undefined, skip setting global root context')
    }
  } catch {
    // don't blow up the execution in case something fails
  }
}

//TODO handle `stopTracing` via `process` event emitter for all the other cases such as
//SIGINT and SIGTERM signals and potential uncaught exceptions
process.on('beforeExit', async () => await stopTracing())

await run()
