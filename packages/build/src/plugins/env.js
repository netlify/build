const isNetlifyCI = require('../utils/is-netlify-ci')
const { removeFalsy } = require('../utils/remove_falsy')

const { getGitEnv } = require('./git')

// Retrieve the environment variables passed to plugins and lifecycle commands.
// When run locally, this tries to emulate the production environment.
const getChildEnv = async function({ baseDir, context, siteInfo }) {
  if (isNetlifyCI()) {
    return process.env
  }

  const defaultEnv = getDefaultEnv(siteInfo)
  const configurableEnv = getConfigurableEnv()
  const forcedEnv = await getForcedEnv(baseDir, context)
  return {
    ...removeFalsy(defaultEnv),
    ...process.env,
    ...removeFalsy(configurableEnv),
    ...removeFalsy(forcedEnv),
  }
}

// Environment variables that can be unset by local ones or configuration ones
const getDefaultEnv = function({ url, build_settings: { repo_url } = {} }) {
  return {
    // Netlify Site information
    URL: url,
    REPOSITORY_URL: repo_url,
  }
}

// Environment variables that can be unset by configuration ones but not local
const getConfigurableEnv = function() {
  return {
    // Localization
    LANG: 'en_US.UTF-8',
    LANGUAGE: 'en_US:en',
    LC_ALL: 'en_US.UTF-8',
    // Disable telemetry of some tools
    GATSBY_TELEMETRY_DISABLED: '1',
    NEXT_TELEMETRY_DISABLED: '1',
  }
}

// Environment variables that can be unset by neither local nor configuration
const getForcedEnv = async function(baseDir, context) {
  const gitEnv = await getGitEnv(baseDir)
  return {
    // Configuration file context
    CONTEXT: context,
    // Git-related environment variables
    ...gitEnv,
  }
}

module.exports = { getChildEnv }
