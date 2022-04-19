import { env, execPath } from 'process'

import { logFlags } from '../log/messages/config.js'
import { removeFalsy } from '../utils/remove_falsy.js'

import { DEFAULT_FEATURE_FLAGS } from './feature_flags.js'

// Normalize CLI flags
export const normalizeFlags = function (flags, logs) {
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
  const normalizedFlags = removeFalsy(mergedFlags)

  logFlags(logs, rawFlags, normalizedFlags)

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
    buildId: combinedEnv.BUILD_ID,
    debug: Boolean(combinedEnv.NETLIFY_BUILD_DEBUG),
    bugsnagKey: combinedEnv.BUGSNAG_KEY,
    sendStatus: false,
    saveConfig: false,
    apiHost: 'api.netlify.com',
    testOpts: {},
    featureFlags: DEFAULT_FEATURE_FLAGS,
    statsd: { port: DEFAULT_STATSD_PORT },
  }
}

// Compute the telemetry flag, it's disabled by default and we want to always disable it
// if BUILD_TELEMETRY_DISABLED is passed.
const computeTelemetry = function (flags, envOpts) {
  return envOpts.BUILD_TELEMETRY_DISABLED ? { telemetry: false } : { telemetry: flags.telemetry }
}

const REQUIRE_MODE = 'require'
const DEFAULT_EDGE_FUNCTIONS_DIST = '.netlify/edge-functions-dist/'
const DEFAULT_FUNCTIONS_DIST = '.netlify/functions/'
const DEFAULT_CACHE_DIR = '.netlify/cache/'
const DEFAULT_STATSD_PORT = 8125
