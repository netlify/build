const isNetlifyCI = require('../utils/is-netlify-ci')

// Retrieve the environment variables passed to plugins and lifecycle commands.
// When run locally, this tries to emulate the production environment.
const getChildEnv = function() {
  if (isNetlifyCI()) {
    return process.env
  }

  const defaultEnv = getDefaultEnv()
  const forcedEnv = getForcedEnv()
  return { ...defaultEnv, ...process.env, ...forcedEnv }
}

// Environment variables that can be unset
const getDefaultEnv = function() {
  return {}
}

// Environment variables that cannot be unset
const getForcedEnv = function() {
  return {
    // Disable telemetry of some tools
    GATSBY_TELEMETRY_DISABLED: '1',
    NEXT_TELEMETRY_DISABLED: '1',
  }
}

module.exports = { getChildEnv }
