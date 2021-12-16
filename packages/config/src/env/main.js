import omit from 'omit.js'

import { removeFalsy } from '../utils/remove_falsy.js'

import { getGitEnv } from './git.js'

// Retrieve this site's environment variable. Also take into account team-wide
// environment variables and addons.
// The buildbot already has the right environment variables. This is mostly
// meant so that local builds can mimic production builds
// TODO: add `netlify.toml` `build.environment`, after normalization
// TODO: add `CONTEXT` and others
export const getEnv = async function ({
  mode,
  config,
  siteInfo,
  accounts,
  addons,
  buildDir,
  branch,
  deployId,
  buildId,
  context,
}) {
  if (mode === 'buildbot') {
    return {}
  }

  const generalEnv = await getGeneralEnv({ siteInfo, buildDir, branch, deployId, buildId, context })
  const [accountEnv, addonsEnv, uiEnv, configFileEnv] = getUserEnv({ config, siteInfo, accounts, addons })

  // Sources of environment variables, in descending order of precedence.
  const sources = [
    { key: 'configFile', values: configFileEnv },
    { key: 'ui', values: uiEnv },
    { key: 'addons', values: addonsEnv },
    { key: 'account', values: accountEnv },
    { key: 'general', values: generalEnv },
  ]

  // A hash mapping names of environment variables to objects containing the following properties:
  // - sources: List of sources where the environment variable was found. The first element is the source that
  //   actually provided the variable (i.e. the one with the highest precedence).
  // - value: The value of the environment variable.
  const env = new Map()

  sources.forEach((source) => {
    Object.keys(source.values).forEach((key) => {
      if (env.has(key)) {
        const { sources: envSources, value } = env.get(key)

        env.set(key, {
          sources: [...envSources, source.key],
          value,
        })
      } else {
        env.set(key, {
          sources: [source.key],
          value: source.values[key],
        })
      }
    })
  })

  return Object.fromEntries(env)
}

// Environment variables not set by users, but meant to mimic the production
// environment.
const getGeneralEnv = async function ({
  siteInfo: { id, name, url, build_settings: { repo_url: REPOSITORY_URL } = {} },
  buildDir,
  branch,
  deployId,
  buildId,
  context,
}) {
  const gitEnv = await getGitEnv(buildDir, branch)
  return removeFalsy({
    SITE_ID: id,
    SITE_NAME: name,
    DEPLOY_ID: deployId,
    BUILD_ID: buildId,
    URL: url,
    REPOSITORY_URL,
    CONTEXT: context,
    NETLIFY_LOCAL: 'true',
    ...gitEnv,
    // Localization
    LANG: 'en_US.UTF-8',
    LANGUAGE: 'en_US:en',
    LC_ALL: 'en_US.UTF-8',
    // Disable telemetry of some tools
    GATSBY_TELEMETRY_DISABLED: '1',
    NEXT_TELEMETRY_DISABLED: '1',
  })
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
  return omit.default(userEnv, READONLY_ENV)
}

const READONLY_ENV = [
  // Set in local builds
  'BRANCH',
  'CACHED_COMMIT_REF',
  'COMMIT_REF',
  'CONTEXT',
  'HEAD',
  'REPOSITORY_URL',
  'URL',

  // CI builds set NETLIFY=true while CLI and programmatic builds set
  // NETLIFY_LOCAL=true
  'NETLIFY',
  'NETLIFY_LOCAL',

  // Not set in local builds because there is no CI build/deploy, incoming hooks nor PR
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
