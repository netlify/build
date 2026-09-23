import type { NetlifyAPI } from '@netlify/api'

import type { MinimalAccount, SiteInfo } from '../types/api.js'
import type { NormalizedNetlifyConfig } from '../types/config.js'
import type { EnvironmentVariable, EnvironmentVariableSource } from '../types/result.js'
import { removeFalsy } from '../utils/remove_falsy.js'

import { getEnvelope } from './envelope.js'
import { getGitEnv } from './git.js'

const NETLIFY_DEFAULT_DOMAIN = '.netlify.app'
// `site.name` is undefined without a token or site ID.
const DEFAULT_SITE_NAME = 'site-name'

/** Variables users can't set: they're set in local builds, or don't apply to them. */
const READONLY_ENV = new Set([
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
])

type EnvOptions = {
  api: NetlifyAPI | undefined
  mode: string
  config: NormalizedNetlifyConfig
  siteInfo: SiteInfo
  accounts: MinimalAccount[]
  buildDir: string
  branch: string
  deployId: string
  skewProtectionToken: string | undefined
  buildId: string
  context: string
  /** The environment of a cached config, whose internal variables are kept. */
  cachedEnv: Record<string, EnvironmentVariable>
}

/**
 * The environment variables of a local build, mimicking a production build. The buildbot already
 * has them, so this is empty in the buildbot.
 */
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
}: EnvOptions): Promise<Record<string, EnvironmentVariable>> {
  if (mode === 'buildbot') {
    return {}
  }

  const generalEnv = await getGeneralEnv({
    siteInfo,
    buildDir,
    branch,
    deployId,
    skewProtectionToken,
    buildId,
    context,
  })
  const accountEnv = await getAccountEnv({ api, siteInfo, accounts, context })

  // Highest precedence first.
  const sources: [EnvironmentVariableSource, Record<string, unknown>][] = [
    ['configFile', cleanUserEnv(config.build.environment)],
    ['ui', cleanUserEnv(siteInfo.build_settings?.env ?? {})],
    ['account', cleanUserEnv(accountEnv)],
    ['general', generalEnv],
    ['internal', getInternalEnv(cachedEnv)],
  ]

  const env = new Map<string, EnvironmentVariable>()
  for (const [source, values] of sources) {
    for (const [key, value] of Object.entries(values)) {
      const existing = env.get(key)
      env.set(
        key,
        existing === undefined
          ? { sources: [source], value: convertToString(value) }
          : { sources: [...existing.sources, source], value: existing.value },
      )
    }
  }

  return Object.fromEntries(env)
}

// Values from `netlify.toml` may be numbers or booleans. `null` and `undefined`, which only other
// sources can set, are kept as is.
const convertToString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return value as unknown as string
  }

  return typeof value === 'string' ? value : (value as { toString(): string }).toString()
}

type GeneralEnvOptions = Pick<
  EnvOptions,
  'siteInfo' | 'buildDir' | 'branch' | 'deployId' | 'skewProtectionToken' | 'buildId' | 'context'
>

/** Variables not set by users, that mimic the production environment. */
const getGeneralEnv = async function ({
  siteInfo,
  buildDir,
  branch,
  deployId,
  skewProtectionToken,
  buildId,
  context,
}: GeneralEnvOptions): Promise<Record<string, string>> {
  const gitEnv = await getGitEnv(buildDir, branch)
  const { name = DEFAULT_SITE_NAME, ssl_url: sslUrl, build_settings: { repo_url: repositoryUrl } = {} } = siteInfo
  return removeFalsy({
    SITE_ID: siteInfo.id,
    SITE_NAME: siteInfo.name,
    DEPLOY_ID: deployId,
    NETLIFY_SKEW_PROTECTION_TOKEN: skewProtectionToken,
    BUILD_ID: buildId,
    ACCOUNT_ID: siteInfo.account_id,
    URL: sslUrl,
    REPOSITORY_URL: repositoryUrl,
    DEPLOY_PRIME_URL: `https://${branch}--${name}${NETLIFY_DEFAULT_DOMAIN}`,
    DEPLOY_URL: `https://${deployId}--${name}${NETLIFY_DEFAULT_DOMAIN}`,
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
  }) as Record<string, string>
}

/**
 * Variables netlify-cli sets itself, rather than getting them from the environment variables API
 * or the Netlify API. Only kept from a cached config.
 */
const getInternalEnv = function (cachedEnv: Record<string, EnvironmentVariable>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(cachedEnv)
      .filter(([, { sources }]) => sources.includes('internal'))
      .map(([key, { value }]) => [key, value]),
  )
}

type AccountEnvOptions = Pick<EnvOptions, 'api' | 'siteInfo' | 'accounts' | 'context'>

/** Account-wide variables. */
const getAccountEnv = async function ({
  api,
  siteInfo,
  accounts,
  context,
}: AccountEnvOptions): Promise<Record<string, string>> {
  if (siteInfo.use_envelope) {
    // A cached site may use the environment variables API while there is no API client.
    return api === undefined ? {} : await getEnvelope({ api, accountId: siteInfo.account_slug, context })
  }

  const account = accounts.find(({ slug }) => slug === siteInfo.account_slug)
  return account?.site_env ?? {}
}

const cleanUserEnv = function (userEnv: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(userEnv).filter(([key]) => !READONLY_ENV.has(key)))
}
