import type { NetlifyAPI } from '@netlify/api'
import omit from 'omit.js'

import { removeFalsy } from '../utils/remove_falsy.js'

import { getEnvelope } from './envelope.js'
import { getGitEnv } from './git.js'

// Retrieve this site's environment variable. Also take into account team-wide
// environment variables.
// The buildbot already has the right environment variables. This is mostly
// meant so that local builds can mimic production builds
// TODO: add `netlify.toml` `build.environment`, after normalization
// TODO: add `CONTEXT` and others
export const getEnv = async function ({
  api,
  mode,
  config,
  siteInfo,
  accounts,
  buildDir,
  branch,
  deployId,
  skewProtectionToken,
  buildId,
  context,
  cachedEnv,
}) {
  if (mode === 'buildbot') {
    return {}
  }

  const internalEnv = getInternalEnv(cachedEnv)
  const generalEnv = await getGeneralEnv({
    siteInfo,
    buildDir,
    branch,
    deployId,
    skewProtectionToken,
    buildId,
    context,
  })
  const [accountEnv, uiEnv, configFileEnv] = await getUserEnv({
    api,
    config,
    siteInfo,
    accounts,
    context,
  })

  // Sources of environment variables, in descending order of precedence.
  const sources = [
    { key: 'configFile', values: configFileEnv },
    { key: 'ui', values: uiEnv },
    { key: 'account', values: accountEnv },
    { key: 'general', values: generalEnv },
    { key: 'internal', values: internalEnv },
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
          value: convertToString(value),
        })
      } else {
        env.set(key, {
          sources: [source.key],
          value: convertToString(source.values[key]),
        })
      }
    })
  })

  return Object.fromEntries(env)
}

const convertToString = (value) => {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'string') {
    return value
  }

  return value.toString()
}

// Environment variables not set by users, but meant to mimic the production
// environment.
const getGeneralEnv = async function ({
  siteInfo,
  siteInfo: { id, name, account_id: accountId },
  buildDir,
  branch,
  deployId,
  skewProtectionToken,
  buildId,
  context,
}) {
  const gitEnv = await getGitEnv(buildDir, branch)
  const deployUrls = getDeployUrls({ siteInfo: siteInfo as $TSFixMe, branch, deployId })
  return removeFalsy({
    SITE_ID: id,
    SITE_NAME: name,
    DEPLOY_ID: deployId,
    NETLIFY_SKEW_PROTECTION_TOKEN: skewProtectionToken,
    BUILD_ID: buildId,
    ACCOUNT_ID: accountId,
    ...deployUrls,
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

/**
 * Retrieve internal environment variables (needed for the CLI).
 * Based on the cached environment, it returns the internal environment variables.
 * Internal environment variables are those that are set by the CLI and are not retrieved by Envelope or the API.
 */
const getInternalEnv = function (
  cachedEnv: Record<string, { sources: string[]; value: string }>,
): Record<string, string> {
  return Object.entries(cachedEnv).reduce(
    (prev, [key, { sources, value }]) => {
      if (sources.includes('internal')) {
        prev[key] = value
      }
      return prev
    },
    {} as Record<string, string>,
  )
}

const getDeployUrls = function ({
  siteInfo: {
    name = DEFAULT_SITE_NAME,
    ssl_url: sslUrl,
    build_settings: { repo_url: REPOSITORY_URL = undefined } = {},
  },
  branch,
  deployId,
}) {
  return {
    URL: sslUrl,
    REPOSITORY_URL,
    DEPLOY_PRIME_URL: `https://${branch}--${name}${NETLIFY_DEFAULT_DOMAIN}`,
    DEPLOY_URL: `https://${deployId}--${name}${NETLIFY_DEFAULT_DOMAIN}`,
  }
}

const NETLIFY_DEFAULT_DOMAIN = '.netlify.app'
// `site.name` is `undefined` when there is no token or siteId
const DEFAULT_SITE_NAME = 'site-name'

// Environment variables specified by the user
const getUserEnv = async function ({ api, config, siteInfo, accounts, context }) {
  const accountEnv = await getAccountEnv({ api, siteInfo, accounts, context })
  const uiEnv = getUiEnv({ siteInfo })
  const configFileEnv = getConfigFileEnv({ config })
  return [accountEnv, uiEnv, configFileEnv].map(cleanUserEnv)
}

// Account-wide environment variables
const getAccountEnv = async function ({
  api,
  siteInfo,
  accounts,
  context,
}: {
  api: NetlifyAPI
  siteInfo: any
  accounts: any
  context?: string
}) {
  if (siteInfo.use_envelope) {
    return await getEnvelope({ api, accountId: siteInfo.account_slug, context })
  }
  const { site_env: siteEnv = {} } = accounts.find(({ slug }) => slug === siteInfo.account_slug) || {}
  return siteEnv
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
  'INCOMING_HOOK_BODY',
  'INCOMING_HOOK_TITLE',
  'INCOMING_HOOK_URL',
  'NETLIFY_BUILD_BASE',
  'NETLIFY_BUILD_LIFECYCLE_TRIAL',
  'NETLIFY_IMAGES_CDN_DOMAIN',
  'PULL_REQUEST',
  'REVIEW_ID',
]
