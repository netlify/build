'use strict'

const omit = require('omit.js').default

const { getGitEnv } = require('./git')

// Retrieve this site's environment variable. Also take into account team-wide
// environment variables and addons.
// The buildbot already has the right environment variables. This is mostly
// meant so that local builds can mimic production builds
// TODO: add `netlify.toml` `build.environment`, after normalization
// TODO: add `CONTEXT` and others
const getEnv = async function ({ mode, config, siteInfo, accounts, addons, buildDir, branch, deployId, context }) {
  if (mode === 'buildbot') {
    return { general: {}, account: {}, addons: {}, ui: {}, configFile: {}, all: {} }
  }

  const generalEnv = await getGeneralEnv({ siteInfo, buildDir, branch, deployId, context })
  const [accountEnv, addonsEnv, uiEnv, configFileEnv] = getUserEnv({ config, siteInfo, accounts, addons })
  return {
    general: generalEnv,
    account: accountEnv,
    addons: addonsEnv,
    ui: uiEnv,
    configFile: configFileEnv,
    // Merging priority matters
    all: { ...generalEnv, ...accountEnv, ...addonsEnv, ...uiEnv, ...configFileEnv },
  }
}

// Environment variables not set by users, but meant to mimic the production
// environment.
const getGeneralEnv = async function ({
  siteInfo: { url, build_settings: { repo_url: REPOSITORY_URL } = {} },
  buildDir,
  branch,
  deployId,
  context,
}) {
  const gitEnv = await getGitEnv(buildDir, branch)
  return {
    ...(deployId === undefined ? {} : { DEPLOY_ID: deployId }),
    // The API sometimes returns `null`, not only `undefined`
    ...(url == null ? {} : { URL: url }),
    ...(REPOSITORY_URL == null ? {} : { REPOSITORY_URL }),
    CONTEXT: context,
    ...gitEnv,
    // Localization
    LANG: 'en_US.UTF-8',
    LANGUAGE: 'en_US:en',
    LC_ALL: 'en_US.UTF-8',
    // Disable telemetry of some tools
    GATSBY_TELEMETRY_DISABLED: '1',
    NEXT_TELEMETRY_DISABLED: '1',
  }
}

// Environment variables specified by the user
const getUserEnv = function ({ config, siteInfo, accounts, addons }) {
  const accountEnv = getAccountEnv({ siteInfo, accounts })
  const addonsEnv = getAddonsEnv(addons)
  const uiEnv = getUiEnv({ siteInfo })
  const configFileEnv = getConfigFileEnv({ config })
  return [accountEnv, addonsEnv, uiEnv, configFileEnv].map(cleanUserEnv)
}

// Account-wide environment variables
const getAccountEnv = function ({ siteInfo: { account_slug: accountSlug }, accounts }) {
  const { site_env: siteEnv = {} } = accounts.find(({ slug }) => slug === accountSlug) || {}
  return siteEnv
}

// Environment variables from addons
const getAddonsEnv = function (addons) {
  return Object.assign({}, ...addons.map(getAddonEnv))
}

const getAddonEnv = function ({ env }) {
  return env
}

// Site-specific environment variables set in the UI
const getUiEnv = function ({ siteInfo: { build_settings: { env = {} } = {} } }) {
  return env
}

// Site-specific environment variables set in netlify.toml
const getConfigFileEnv = function ({
  config: {
    build: { environment = {} },
  },
}) {
  return environment
}

// Some environment variables cannot be overridden by configuration
const cleanUserEnv = function (userEnv) {
  return omit(userEnv, READONLY_ENV)
}

const READONLY_ENV = [
  // Set in local builds
  'BRANCH',
  'CACHED_COMMIT_REF',
  'COMMIT_REF',
  'CONTEXT',
  'DEPLOY_ID',
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

module.exports = { getEnv }
