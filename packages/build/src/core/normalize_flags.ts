import { env, execPath } from 'process'

import { logFlags } from '../log/messages/config.js'
import { removeFalsy } from '../utils/remove_falsy.js'

import { DEFAULT_FEATURE_FLAGS } from './feature_flags.js'
import type { BuildFlags, Mode, TestOptions } from './types.js'

export const DEFAULT_API_HOST = 'api.netlify.com'
const REQUIRE_MODE: Mode = 'require'
const DEFAULT_EDGE_FUNCTIONS_DIST = '.netlify/edge-functions-dist/'
const DEFAULT_FUNCTIONS_DIST = '.netlify/functions/'
const DEFAULT_CACHE_DIR = '.netlify/cache/'
const DEFAULT_STATSD_PORT = 8125

const DEFAULT_OTEL_TRACING_PORT = 4317
const DEFAULT_OTEL_ENDPOINT_PROTOCOL = 'http'

export type ResolvedFlags = {
  env: Record<string, unknown>
  token: string
  mode: Mode
  offline: boolean
  telemetry: boolean
  verbose: boolean
  /** The dist directory of the functions @default `.netlify/functions/` */
  functionsDistDir: string
  /** The dist directory of the edge functions @default `.netlify/edge-functions-dist/` */
  edgeFunctionsDistDir: string
  /** The directory that is used for storing the cache @default `.netlify/cache/` */
  cacheDir: string
  debug: boolean
  sendStatus: boolean
  saveConfig: boolean
  /** Netlify API endpoint @default `api.netlify.com` */
  apiHost?: string
  testOpts: TestOptions
  statsd: { port: number }
  timeline: 'build' | string
  cachedConfig: Record<string, unknown>
  siteId: string
  dry: false
  context: 'production' | string
  statsdOpts: { host?: number; port: number }
  bugsnagKey?: string
  systemLogFile?: number
}

/** Normalize CLI flags  */
export const normalizeFlags = function (flags: Partial<BuildFlags>, logs): ResolvedFlags {
  const rawFlags = removeFalsy(flags)

  // Combine the flags object env with the process.env
  const combinedEnv = { ...env, ...rawFlags.env }
  const defaultFlags = getDefaultFlags(rawFlags, combinedEnv)

  // The telemetry flag requires specific logic to compute
  const telemetryFlag = computeTelemetry(rawFlags, combinedEnv)

  const mergedFlags = {
    ...defaultFlags,
    ...rawFlags,
    ...telemetryFlag,
    statsdOpts: { ...defaultFlags.statsd, ...rawFlags.statsd },
    featureFlags: { ...defaultFlags.featureFlags, ...rawFlags.featureFlags },
  }
  const normalizedFlags = removeFalsy(mergedFlags) as any

  if (!flags.quiet) {
    logFlags(logs, rawFlags, normalizedFlags)
  }

  return normalizedFlags
}

// Default values of CLI flags
const getDefaultFlags = function ({ env: envOpt = {} }, combinedEnv) {
  return {
    env: envOpt,
    nodePath: execPath,
    token: combinedEnv.NETLIFY_AUTH_TOKEN,
    mode: REQUIRE_MODE,
    offline: false,
    telemetry: false,
    verbose: Boolean(combinedEnv.NETLIFY_BUILD_DEBUG),
    functionsDistDir: DEFAULT_FUNCTIONS_DIST,
    edgeFunctionsDistDir: DEFAULT_EDGE_FUNCTIONS_DIST,
    cacheDir: DEFAULT_CACHE_DIR,
    deployId: combinedEnv.DEPLOY_ID,
    skewProtectionToken: combinedEnv.NETLIFY_SKEW_PROTECTION_TOKEN,
    buildId: combinedEnv.BUILD_ID,
    debug: Boolean(combinedEnv.NETLIFY_BUILD_DEBUG),
    bugsnagKey: combinedEnv.BUGSNAG_KEY,
    sendStatus: false,
    saveConfig: false,
    apiHost: DEFAULT_API_HOST,
    testOpts: {},
    featureFlags: DEFAULT_FEATURE_FLAGS,
    statsd: { port: DEFAULT_STATSD_PORT },
    // tracing.apiKey defaults to '-' else we'll get warning logs if not using
    // honeycomb directly - https://github.com/honeycombio/honeycomb-opentelemetry-node/issues/201
    tracing: {
      enabled: false,
      preloadingEnabled: false,
      apiKey: '-',
      // defaults to always sample
      sampleRate: 1,
      httpProtocol: DEFAULT_OTEL_ENDPOINT_PROTOCOL,
      port: DEFAULT_OTEL_TRACING_PORT,
      baggageFilePath: '',
    },
    timeline: 'build',
    quiet: false,
  }
}

// Compute the telemetry flag, it's disabled by default, and we want to always disable it
// if BUILD_TELEMETRY_DISABLED is passed.
const computeTelemetry = function (flags, envOpts) {
  return envOpts.BUILD_TELEMETRY_DISABLED ? { telemetry: false } : { telemetry: flags.telemetry }
}
