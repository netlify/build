const { env, execPath } = require('process')

const { logFlags } = require('../log/main')
const { removeFalsy } = require('../utils/remove_falsy')

const { normalizeFeatureFlags, DEFAULT_FEATURE_FLAGS } = require('./feature_flags')

// Normalize CLI flags
const normalizeFlags = function(flags, logs) {
  const rawFlags = removeFalsy(flags)
  const rawFlagsA = normalizeFeatureFlags(rawFlags)
  const defaultFlags = getDefaultFlags(rawFlagsA)
  const mergedFlags = {
    ...defaultFlags,
    ...rawFlagsA,
    statsdOpts: { ...defaultFlags.statsd, ...rawFlagsA.statsd },
    featureFlags: { ...defaultFlags.featureFlags, ...rawFlagsA.featureFlags },
  }
  const normalizedFlags = removeFalsy(mergedFlags)

  logFlags(logs, rawFlagsA, normalizedFlags)

  return normalizedFlags
}

// Default values of CLI flags
const getDefaultFlags = function({ env: envOpt = {} }) {
  const combinedEnv = { ...env, ...envOpt }
  return {
    env: envOpt,
    nodePath: execPath,
    token: combinedEnv.NETLIFY_AUTH_TOKEN,
    mode: 'require',
    functionsDistDir: DEFAULT_FUNCTIONS_DIST,
    deployId: combinedEnv.DEPLOY_ID,
    debug: Boolean(combinedEnv.NETLIFY_BUILD_DEBUG),
    bugsnagKey: combinedEnv.BUGSNAG_KEY,
    telemetry: !combinedEnv.BUILD_TELEMETRY_DISABLED,
    sendStatus: false,
    testOpts: {},
    featureFlags: DEFAULT_FEATURE_FLAGS,
    statsd: { port: DEFAULT_STATSD_PORT },
  }
}

const DEFAULT_FUNCTIONS_DIST = '.netlify/functions/'
const DEFAULT_STATSD_PORT = 8125

module.exports = { normalizeFlags }
