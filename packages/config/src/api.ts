import { format } from 'node:util'

import { NetlifyAPI } from '@netlify/api'
import * as z from 'zod'

import { getErrorMessage, throwUserError } from './error.js'
import { fetchExtensions } from './extensions.js'
import { ERROR_CALL_TO_ACTION } from './extensions_api.js'
import { log } from './log.js'
import type { ResolvedOptions } from './options.js'
import type { Account, Config, Extension, Logs, SiteInfo } from './types.js'
import { parseLeniently } from './validate/lenient.js'

// These describe the published types, not the whole API response, so the API can add properties freely.

export const accountSchema: z.ZodType<Account> = z.looseObject({
  slug: z.string(),
  site_env: z.record(z.string(), z.string()).optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  default: z.boolean().optional(),
  team_logo_url: z.string().nullable().optional(),
  on_pro_trial: z.boolean().optional(),
  organization_id: z.string().nullable().optional(),
  type_name: z.string().optional(),
  type_slug: z.string().optional(),
  members_count: z.number().optional(),
})

const uiPluginSchema = z.looseObject({
  package: z.string(),
  inputs: z.record(z.string(), z.unknown()).exactOptional(),
  pinned_version: z.string().exactOptional(),
})

const buildSettingsSchema = z.looseObject({
  base: z.string().nullable().exactOptional(),
  base_rel_dir: z.boolean().nullable().exactOptional(),
  cmd: z.string().nullable().exactOptional(),
  dir: z.string().nullable().exactOptional(),
  env: z.record(z.string(), z.string()).nullable().exactOptional(),
  functions_dir: z.string().nullable().exactOptional(),
  repo_url: z.string().nullable().exactOptional(),
})

export const siteSchema: z.ZodType<SiteInfo> = z.looseObject({
  account_id: z.string().exactOptional(),
  account_slug: z.string().exactOptional(),
  build_settings: buildSettingsSchema.exactOptional(),
  feature_flags: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).exactOptional(),
  id: z.string().exactOptional(),
  name: z.string().exactOptional(),
  plugins: z.array(uiPluginSchema).exactOptional(),
  ssl_url: z.string().exactOptional(),
  use_envelope: z.boolean().exactOptional(),
})

export const getApiClient = function (options: ResolvedOptions): NetlifyAPI | undefined {
  const { token, offline, testOpts, pathPrefix } = options
  if (!token || offline) {
    return
  }

  const scheme = nonEmpty(testOpts.scheme) ?? options.scheme
  const host = nonEmpty(testOpts.host) ?? options.host
  return new NetlifyAPI(token, {
    ...(scheme !== undefined && { scheme }),
    ...(host !== undefined && { host }),
    ...(pathPrefix !== undefined && { pathPrefix }),
  })
}

// An empty test value falls back to the option, as it always has.
const nonEmpty = (value: string | undefined) => (value === '' ? undefined : value)

export interface SiteData {
  siteInfo: SiteInfo
  accounts: Account[]
  extensions: Extension[]
}

export const getSiteData = async function ({
  options,
  api,
  cached,
}: {
  options: ResolvedOptions
  api: NetlifyAPI | undefined
  cached: Config | undefined
}): Promise<SiteData> {
  const cachedSiteData = getCachedSiteData(options, cached)
  if (cachedSiteData !== undefined) {
    return cachedSiteData
  }

  const { mode, offline, testOpts } = options
  if (api === undefined || mode === 'buildbot' || testOpts.env) {
    const extensions = mode === 'buildbot' && !offline ? await fetchExtensions(options) : []
    return { siteInfo: getKnownSiteInfo(options), accounts: [], extensions }
  }

  const [siteInfo, accounts, extensions] = await Promise.all([
    getSite(api, options),
    getAccounts(api, options.logs),
    fetchExtensions(options),
  ])
  return { siteInfo: await addEnvelope(api, siteInfo, options), accounts, extensions }
}

const getCachedSiteData = function ({ featureFlags, logs }: ResolvedOptions, cached: Config | undefined) {
  // The cache is only checked leniently, so any of these may be missing.
  const { siteInfo, accounts, integrations: extensions }: Partial<Config> = cached ?? {}
  const useCachedSiteInfo = Boolean(featureFlags['use_cached_site_info'] && siteInfo && accounts && extensions)

  if (featureFlags['use_cached_site_info_logging']) {
    log(logs, format('Checking site information', { useCachedSiteInfo, siteInfo, accounts, extensions }))
  }

  return useCachedSiteInfo && siteInfo && accounts && extensions ? { siteInfo, accounts, extensions } : undefined
}

const getKnownSiteInfo = ({ siteId, accountId }: ResolvedOptions): SiteInfo => ({
  ...(siteId !== undefined && { id: siteId }),
  ...(accountId !== undefined && { account_id: accountId }),
})

const getSite = async function (api: NetlifyAPI, { siteId, siteFeatureFlagPrefix, logs }: ResolvedOptions) {
  if (siteId === undefined) {
    return {}
  }

  try {
    // `feature_flags` is internal (x-internal), so the published types leave it out.
    const params: Parameters<NetlifyAPI['getSite']>[0] & { feature_flags: string | undefined } = {
      siteId,
      feature_flags: siteFeatureFlagPrefix,
    }
    const site = parseLeniently(siteSchema, await api.getSite(params), {
      description: 'site information from the Netlify API',
      logs,
    })
    return { ...site, id: siteId }
  } catch (error) {
    throwUserError(`Failed retrieving site data for site ${siteId}: ${getErrorMessage(error)}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const getAccounts = async function (api: NetlifyAPI, logs: Logs | undefined): Promise<Account[]> {
  try {
    // `minimal` is internal (x-internal), so the published types say this method takes no parameters.
    const accounts: unknown = await Reflect.apply(api.listAccountsForUser, api, [{ minimal: 'true' }])
    // Any other shape has always meant no accounts.
    return Array.isArray(accounts)
      ? parseLeniently(z.array(accountSchema), accounts, { description: 'accounts from the Netlify API', logs })
      : []
  } catch (error) {
    throwUserError(`Failed retrieving user account: ${getErrorMessage(error)}. ${ERROR_CALL_TO_ACTION}`)
  }
}

/** Sites using the environment variables API get their variables from it, not from `build_settings.env`. */
const addEnvelope = async function (api: NetlifyAPI, siteInfo: SiteInfo, { siteId, context }: ResolvedOptions) {
  if (!siteInfo.use_envelope) {
    return siteInfo
  }

  const env = await getEnvelope({ api, accountId: siteInfo.account_slug, siteId, context })
  return { ...siteInfo, build_settings: { ...siteInfo.build_settings, env } }
}

type EnvelopeContext = NonNullable<
  Extract<Parameters<NetlifyAPI['getEnvVars']>[0], { context_name?: unknown }>['context_name']
>

export const getEnvelope = async function ({
  api,
  accountId,
  siteId,
  context,
}: {
  api: NetlifyAPI
  accountId: string | undefined
  siteId?: string | undefined
  context: string
}): Promise<Record<string, string>> {
  if (accountId === undefined) {
    return {}
  }

  try {
    const variables = await api.getEnvVars({
      accountId,
      ...(siteId !== undefined && { siteId }),
      // The API accepts any context, not only the ones its published types list.
      contextName: context as EnvelopeContext,
    })
    return Object.fromEntries(
      variables.sort(compareKeys).flatMap(({ key, values = [] }) => {
        const value = values.find((envValue) => envValue.context === 'all' || envValue.context === context)?.value
        return key !== undefined && value ? [[key, value]] : []
      }),
    )
  } catch {
    return {}
  }
}

// QUIRK: never returns 0, as always. V8 then keeps equal keys in their original order.
const compareKeys = ({ key: left = '' }: { key?: string }, { key: right = '' }: { key?: string }) =>
  left.toLowerCase() < right.toLowerCase() ? -1 : 1
