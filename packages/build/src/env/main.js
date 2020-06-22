const { env } = require('process')

const filterObj = require('filter-obj')

const { getParentColorEnv } = require('../log/colors')
const { omit } = require('../utils/omit')

const { getGitEnv } = require('./git')

// Retrieve the environment variables passed to plugins and `build.command`
// When run locally, this tries to emulate the production environment.
const getChildEnv = async function({ netlifyConfig, buildDir, branch, context, siteInfo, deployId, envOpt, mode }) {
  const parentEnv = getParentEnv(envOpt)

  if (mode === 'buildbot') {
    return parentEnv
  }

  const defaultEnv = getDefaultEnv()
  const configurableEnv = getConfigurableEnv()
  const configEnv = getConfigEnv(netlifyConfig, deployId)
  const forcedEnv = await getForcedEnv({ buildDir, branch, context, siteInfo })
  return {
    ...defaultEnv,
    ...parentEnv,
    ...configurableEnv,
    ...configEnv,
    ...forcedEnv,
  }
}

// Current process's environment variables, with some of them removed
const getParentEnv = function(envOpt) {
  const parentEnv = { ...env, ...envOpt }
  return filterObj(parentEnv, shouldKeepEnv)
}

const shouldKeepEnv = function(key) {
  return !REMOVED_PARENT_ENV.includes(key.toLowerCase())
}

const REMOVED_PARENT_ENV = ['bugsnag_key']

// Environment variables that can be unset by local ones or configuration ones
const getDefaultEnv = function() {
  return {}
}

// Environment variables that can be unset by configuration ones but not local
const getConfigurableEnv = function() {
  const parentColorEnv = getParentColorEnv()
  return {
    // Localization
    LANG: 'en_US.UTF-8',
    LANGUAGE: 'en_US:en',
    LC_ALL: 'en_US.UTF-8',
    // Disable telemetry of some tools
    GATSBY_TELEMETRY_DISABLED: '1',
    NEXT_TELEMETRY_DISABLED: '1',
    // Colors
    ...parentColorEnv,
  }
}

// Environment variables specified in UI settings, in `build.environment` or
// in CLI flags
const getConfigEnv = function({ build: { environment } }, deployId) {
  const deployIdEnv = deployId === undefined ? {} : { DEPLOY_ID: deployId }
  const configEnv = omit(environment, READONLY_ENV)
  return { ...deployIdEnv, ...configEnv }
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
