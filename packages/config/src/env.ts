import type { NetlifyAPI } from '@netlify/api'

import { getEnvelope } from './api.js'
import { runGit } from './git.js'
import type { ResolvedOptions } from './options.js'
import type { Account, EnvironmentVariable, EnvironmentVariableSource, NetlifyConfig, SiteInfo } from './types.js'

/** Variables users can't set: they're set in local builds, or don't apply to them. */
const READONLY_NAMES = new Set([
  // Set in local builds
  'BRANCH',
  'CACHED_COMMIT_REF',
  'COMMIT_REF',
  'CONTEXT',
  'HEAD',
  'REPOSITORY_URL',
  'URL',
  // CI builds set `NETLIFY`, local builds `NETLIFY_LOCAL`
  'NETLIFY',
  'NETLIFY_LOCAL',
  // Local builds have no CI build or deploy, incoming hooks nor pull requests
  'INCOMING_HOOK_BODY',
  'INCOMING_HOOK_TITLE',
  'INCOMING_HOOK_URL',
  'NETLIFY_BUILD_BASE',
  'NETLIFY_BUILD_LIFECYCLE_TRIAL',
  'NETLIFY_IMAGES_CDN_DOMAIN',
  'PULL_REQUEST',
  'REVIEW_ID',
])

/** None in the buildbot, which already has them. */
export const getEnv = async function ({
  options,
  api,
  siteInfo,
  accounts,
  config,
  buildDir,
  branch,
  cachedEnv,
}: {
  options: ResolvedOptions
  api: NetlifyAPI | undefined
  siteInfo: SiteInfo
  accounts: Account[]
  config: NetlifyConfig
  buildDir: string
  branch: string
  /** From a cached config that is resolved again: its `internal` variables are kept. */
  cachedEnv: Record<string, EnvironmentVariable> | undefined
}): Promise<Record<string, EnvironmentVariable>> {
  if (options.mode === 'buildbot') {
    return {}
  }

  const [generalEnv, accountEnv] = await Promise.all([
    getGeneralEnv({ options, siteInfo, buildDir, branch }),
    getAccountEnv({ api, siteInfo, accounts, context: options.context }),
  ])

  // Highest precedence first.
  const sources: [EnvironmentVariableSource, Record<string, unknown>][] = [
    ['configFile', removeReadonly(config.build.environment)],
    ['ui', removeReadonly(siteInfo.build_settings?.env ?? {})],
    ['account', removeReadonly(accountEnv)],
    ['general', generalEnv],
    ['internal', getInternalEnv(cachedEnv ?? {})],
  ]
  return mergeSources(sources)
}

const removeReadonly = (env: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(env).filter(([name]) => !READONLY_NAMES.has(name)))

// A variable is set even when its value is `''`, `null` or `undefined`.
const mergeSources = function (
  sources: [EnvironmentVariableSource, Record<string, unknown>][],
): Record<string, EnvironmentVariable> {
  const env = new Map<string, EnvironmentVariable>()
  for (const [source, values] of sources) {
    for (const [name, value] of Object.entries(values)) {
      const existing = env.get(name)
      env.set(
        name,
        existing === undefined
          ? { sources: [source], value: toValue(value) }
          : { sources: [...existing.sources, source], value: existing.value },
      )
    }
  }
  return Object.fromEntries(env)
}

// QUIRK: `null` and `undefined`, set only by JSON sources and mutations, are kept as is, although the
// result type says `string`. Other values are stringified as `toString()` always did, however unhelpful.
const toValue = function (value: unknown): string {
  if (value === null || value === undefined) {
    return keepAsIs(value)
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date) {
    return value.toString()
  }
  return Array.isArray(value) ? value.join(',') : Object.prototype.toString.call(value)
}

const keepAsIs = (value: unknown) => value as string

/** Variables users don't set, which mimic those of a build on Netlify. */
const getGeneralEnv = async function ({
  options: { deployId, buildId, skewProtectionToken, context },
  siteInfo,
  buildDir,
  branch,
}: {
  options: ResolvedOptions
  siteInfo: SiteInfo
  buildDir: string
  branch: string
}): Promise<Record<string, unknown>> {
  const { commitRef, cachedCommitRef } = await getCommitRefs(buildDir)
  // QUIRK: only `undefined` gets the default, so `name: null` gives `branch--null.netlify.app`.
  const { name = 'site-name' } = siteInfo
  return removeBlank({
    SITE_ID: siteInfo.id,
    SITE_NAME: siteInfo.name,
    DEPLOY_ID: deployId,
    NETLIFY_SKEW_PROTECTION_TOKEN: skewProtectionToken,
    BUILD_ID: buildId,
    ACCOUNT_ID: siteInfo.account_id,
    URL: siteInfo.ssl_url,
    REPOSITORY_URL: siteInfo.build_settings?.repo_url,
    DEPLOY_PRIME_URL: `https://${branch}--${name}.netlify.app`,
    DEPLOY_URL: `https://${deployId}--${name}.netlify.app`,
    CONTEXT: context,
    NETLIFY_LOCAL: 'true',
    BRANCH: branch,
    HEAD: branch,
    COMMIT_REF: commitRef,
    CACHED_COMMIT_REF: cachedCommitRef,
    PULL_REQUEST: 'false',
    LANG: 'en_US.UTF-8',
    LANGUAGE: 'en_US:en',
    LC_ALL: 'en_US.UTF-8',
    GATSBY_TELEMETRY_DISABLED: '1',
    NEXT_TELEMETRY_DISABLED: '1',
  })
}

// One process instead of two, since spawning takes most of a typical call's time. The first parent
// is `HEAD^`. `--` stops a file named `HEAD` making the revision ambiguous.
const getCommitRefs = async function (
  buildDir: string,
): Promise<{ commitRef: string | undefined; cachedCommitRef: string | undefined }> {
  const commits = await runGit(['rev-list', '--max-count=1', '--parents', 'HEAD', '--'], buildDir)
  const [commitRef, cachedCommitRef] = commits === undefined ? [] : commits.split(' ')
  return { commitRef, cachedCommitRef }
}

// Values are not checked, so `siteInfo.name` may be a number, which is kept.
const removeBlank = (env: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(env).filter(
      ([, value]) => value !== null && value !== undefined && !(typeof value === 'string' && value.trim() === ''),
    ),
  )

const getAccountEnv = async function ({
  api,
  siteInfo: { use_envelope: useEnvelope, account_slug: accountSlug },
  accounts,
  context,
}: {
  api: NetlifyAPI | undefined
  siteInfo: SiteInfo
  accounts: Account[]
  context: string
}): Promise<Record<string, string>> {
  if (useEnvelope) {
    // Only a cached site can use the environment variables API without a client.
    return api === undefined ? {} : await getEnvelope({ api, accountId: accountSlug, context })
  }

  return accounts.find(({ slug }) => slug === accountSlug)?.site_env ?? {}
}

/**
 * Variables netlify-cli sets itself, which it passes to `@netlify/build` in a cached config.
 * QUIRK: an entry any of whose sources is `internal` counts, with the value of its highest source.
 */
const getInternalEnv = (cachedEnv: Record<string, EnvironmentVariable>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(cachedEnv)
      .filter(([, { sources }]) => sources.includes('internal'))
      .map(([name, { value }]) => [name, value]),
  )
