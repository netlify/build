const { env, execPath } = require('process')

const { logFlags } = require('../log/main')
const { removeFalsy } = require('../utils/remove_falsy')

// Normalize CLI flags
const normalizeFlags = function(flags, logs) {
  const rawFlags = removeFalsy(flags)
  const defaultFlags = getDefaultFlags(rawFlags)
  const mergedFlags = { ...defaultFlags, ...rawFlags }
  const normalizedFlags = removeFalsy(mergedFlags)

  logFlags(logs, rawFlags, normalizedFlags)

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
  }
}

const DEFAULT_FUNCTIONS_DIST = '.netlify/functions/'

module.exports = { normalizeFlags }
