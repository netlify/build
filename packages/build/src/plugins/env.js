const omit = require('omit.js')

const isNetlifyCI = require('../utils/is-netlify-ci')
const { removeFalsy } = require('../utils/remove_falsy')

const { getGitEnv } = require('./git')

// Retrieve the environment variables passed to plugins and lifecycle commands.
// When run locally, this tries to emulate the production environment.
const getChildEnv = async function({ netlifyConfig, buildDir, branch, context, siteInfo }) {
  if (isNetlifyCI()) {
    return process.env
  }

  const defaultEnv = getDefaultEnv()
  const configurableEnv = getConfigurableEnv()
  const configEnv = getConfigEnv(netlifyConfig)
  const forcedEnv = await getForcedEnv({ buildDir, branch, context, siteInfo })
  return {
    ...removeFalsy(defaultEnv),
    ...process.env,
    ...removeFalsy(configurableEnv),
    ...removeFalsy(configEnv),
    ...removeFalsy(forcedEnv),
  }
}

// Environment variables that can be unset by local ones or configuration ones
const getDefaultEnv = function() {
  return {}
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

// Environment variables specified in UI settings or in `build.environment`
const getConfigEnv = function({ build: { environment } }) {
  return omit(environment, READONLY_ENV)
}

// Those environment variables cannot be overriden by configuration
const READONLY_ENV = [
  // Set in local builds
  'BRANCH',
  'CACHED_COMMIT_REF',
  'COMMIT_REF',
  'CONTEXT',
  'HEAD',
  'REPOSITORY_URL',
  'URL',

  // Purposely left unset in local builds
  'NETLIFY',

  // Not set in local builds because there is CI build/deploy, incoming hooks nor PR
  'BUILD_ID',
  'DEPLOY_ID',
  'DEPLOY_PRIME_URL',
  'DEPLOY_URL',
  'INCOMING_HOOK_BODY',
  'INCOMING_HOOK_TITLE',
  'INCOMING_HOOK_URL',
  'NETLIFY_BUILD_BASE',
  'NETLIFY_BUILD_LIFECYCLE_TRIAL',
  'NETLIFY_IMAGES_CDN_DOMAIN',
  'PULL_REQUEST',
  'REVIEW_ID',
]

// Environment variables that can be unset by neither local nor configuration
const getForcedEnv = async function({
  buildDir,
  branch,
  context,
  siteInfo: { url, build_settings: { repo_url } = {} },
}) {
  const gitEnv = await getGitEnv(buildDir, branch)
  return {
    // Netlify Site information
    URL: url,
    REPOSITORY_URL: repo_url,
    // Configuration file context
    CONTEXT: context,
    // Git-related environment variables
    ...gitEnv,
  }
}

module.exports = { getChildEnv }
