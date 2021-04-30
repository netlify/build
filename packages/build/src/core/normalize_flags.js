'use strict'

const { env, execPath } = require('process')

const { logFlags } = require('../log/messages/config')
const { removeFalsy } = require('../utils/remove_falsy')

const { normalizeFeatureFlags, DEFAULT_FEATURE_FLAGS } = require('./feature_flags')

// Normalize CLI flags
const normalizeFlags = function (flags, logs) {
  const rawFlags = removeFalsy(flags)
  const rawFlagsA = normalizeFeatureFlags(rawFlags)

  // Combine the flags object env with the process.env
  const combinedEnv = { ...env, ...rawFlagsA.env }
  const defaultFlags = getDefaultFlags(rawFlagsA, combinedEnv)

  // Combine feature flags with their default values
  const featureFlags = { ...defaultFlags.featureFlags, ...rawFlagsA.featureFlags }

  // The telemetry flag requires specific logic to compute
  const telemetryFlag = computeTelemetry(rawFlagsA, combinedEnv, featureFlags)

  const mergedFlags = {
    ...defaultFlags,
    ...rawFlagsA,
    ...telemetryFlag,
    statsdOpts: { ...defaultFlags.statsd, ...rawFlagsA.statsd },
    featureFlags,
  }
  const normalizedFlags = removeFalsy(mergedFlags)

  logFlags(logs, rawFlagsA, normalizedFlags)

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
    functionsDistDir: DEFAULT_FUNCTIONS_DIST,
    cacheDir: DEFAULT_CACHE_DIR,
    deployId: combinedEnv.DEPLOY_ID,
    debug: Boolean(combinedEnv.NETLIFY_BUILD_DEBUG),
    bugsnagKey: combinedEnv.BUGSNAG_KEY,
    sendStatus: false,
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
const DEFAULT_FUNCTIONS_DIST = '.netlify/functions/'
const DEFAULT_CACHE_DIR = '.netlify/cache/'
const DEFAULT_STATSD_PORT = 8125

module.exports = { normalizeFlags }
