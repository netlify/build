import type { NetlifyAPI } from '@netlify/api'
import * as z from 'zod'

import { getEnvelope } from '../env/envelope.js'
import { throwUserError } from '../error.js'
import {
  EXTENSION_API_BASE_URL,
  EXTENSION_API_STAGING_BASE_URL,
  NETLIFY_API_HOSTNAME,
  NETLIFY_API_STAGING_HOSTNAME,
} from '../extensions.js'
import { ERROR_CALL_TO_ACTION } from '../log/messages.js'
import type { Extension, MinimalAccount, SiteInfo } from '../types/api.js'
import type { ModeOption, TestOptions } from '../types/options.js'
import { ROOT_PACKAGE_JSON } from '../utils/json.js'

/** What `@netlify/config` knows about the site from the API. */
export type SiteData = {
  siteInfo: SiteInfo
  accounts: MinimalAccount[]
  extensions: Extension[]
}

type SiteInfoOptions = {
  api: NetlifyAPI | undefined
  siteId: string | undefined
  accountId: string | undefined
  mode: ModeOption
  context: string
  offline: boolean
  testOpts: TestOptions
  siteFeatureFlagPrefix: string | undefined
  token: string | undefined
  featureFlags: Record<string, unknown>
  extensionApiBaseUrl: string
}

/**
 * The site, the user's accounts and the site's extensions, for local builds; the buildbot passes
 * these itself. Without an API client, in the buildbot or with `testOpts.env`, only the IDs (and,
 * in the buildbot, the extensions) are known.
 */
export const getSiteInfo = async function ({
  api,
  siteId,
  accountId,
  mode,
  context,
  offline,
  testOpts,
  siteFeatureFlagPrefix,
  token,
  featureFlags,
  extensionApiBaseUrl,
}: SiteInfoOptions): Promise<SiteData> {
  const extensionsOptions = { siteId, accountId, testOpts, offline, token, featureFlags, extensionApiBaseUrl, mode }

  if (api === undefined || mode === 'buildbot' || testOpts.env) {
    const siteInfo: SiteInfo = {
      ...(siteId !== undefined && { id: siteId }),
      ...(accountId !== undefined && { account_id: accountId }),
    }
    const extensions = mode === 'buildbot' && !offline ? await getExtensions(extensionsOptions) : []
    return { accounts: [], extensions, siteInfo }
  }

  const [siteInfo, accounts, extensions] = await Promise.all([
    getSite(api, siteId, siteFeatureFlagPrefix),
    getAccounts(api),
    getExtensions(extensionsOptions),
  ])

  // TODO(ndhoule): Investigate, but at this point, I'm fairly sure this is the default for all
  // sites. If so, we can remove this conditional and always query for environment variables.
  if (siteInfo.use_envelope) {
    const envelope = await getEnvelope({ api, accountId: siteInfo.account_slug, siteId, context })
    siteInfo.build_settings = { ...siteInfo.build_settings, env: envelope }
  }

  return { siteInfo, accounts, extensions }
}

const getSite = async function (
  api: NetlifyAPI,
  siteId: string | undefined,
  siteFeatureFlagPrefix: string | undefined,
): Promise<SiteInfo> {
  if (siteId === undefined) {
    return {}
  }

  try {
    const site = await api.getSite({
      // @ts-expect-error: Internal parameter that instructs the API to include all the site's
      // feature flags in the response.
      feature_flags: siteFeatureFlagPrefix,
      siteId,
    })
    return { ...site, id: siteId }
  } catch (error) {
    throwUserError(`Failed retrieving site data for site ${siteId}: ${getMessage(error)}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const getAccounts = async function (api: NetlifyAPI): Promise<MinimalAccount[]> {
  try {
    const accounts: unknown = await api.listAccountsForUser(
      // @ts-expect-error(ndhoule): This is an unpublished, internal querystring parameter
      { minimal: 'true' },
    )
    return Array.isArray(accounts) ? (accounts as MinimalAccount[]) : []
  } catch (error) {
    throwUserError(`Failed retrieving user account: ${getMessage(error)}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const getMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

const ExtensionResponseSchema = z.array(
  z.object({
    // ndhoule: The `author` and `extension_token` fields are not sent by the .../safe endpoint;
    // we're normalizing them to empty values here to preserve...uh, whatever backward compatibility
    // this is supposed to offer.
    //
    // At this point, I'm unsure if modern `@netlify/config` callers can end up in the .../safe
    // codepath. This would be bad: extension-injected build hooks are far removed from this code
    // path and have no way of knowing whether or not a specific consumer is in this legacy code
    // path. They might call the Netlify API expecting to have an API token available to them when
    // they really don't. For the time being, I've added instrumentation to Jigsaw to help us figure
    // out if this is dead code or actually supports current users.
    author: z.string().optional(),
    extension_token: z.string().optional(),
    has_build: z.boolean(),
    name: z.string(),
    slug: z.string(),
    version: z.string(),

    // Returned by API, but unused. Leaving this here for the sake of documentation.
    // has_connector: z.boolean(),
  }),
)

type ExtensionsOptions = {
  siteId: string | undefined
  accountId: string | undefined
  testOpts: TestOptions
  offline: boolean
  token: string | undefined
  featureFlags: Record<string, unknown>
  extensionApiBaseUrl: string
  mode: ModeOption
}

/** The extensions installed on the site, from the extension API. */
export const getExtensions = async function ({
  siteId,
  accountId,
  testOpts,
  offline,
  token,
  featureFlags,
  extensionApiBaseUrl,
  mode,
}: ExtensionsOptions): Promise<Extension[]> {
  if (!siteId || offline) {
    return []
  }

  const baseUrl = new URL(getTestExtensionApiBaseUrl(testOpts.host) ?? extensionApiBaseUrl)
  // Without an account ID, use the older site-level endpoint.
  const url = accountId
    ? `${baseUrl.href}team/${accountId}/integrations/installations/meta/${siteId}`
    : `${baseUrl.href}site/${siteId}/integrations/safe`
  const headers = new Headers({
    'Netlify-Config-Mode': mode,
    'User-Agent': `Netlify Config (mode:${mode}) / ${ROOT_PACKAGE_JSON.version}`,
  })
  if (featureFlags.send_build_bot_token_to_jigsaw && token) {
    headers.set('Netlify-SDK-Build-Bot-Token', token)
  }

  try {
    const response = await fetch(url, { headers })
    if (response.status !== 200) {
      throw new Error(`Unexpected status code ${String(response.status)} from fetching extensions`)
    }
    return ExtensionResponseSchema.parse(await response.json())
  } catch (error) {
    throwUserError(
      `Failed retrieving extensions for site ${siteId}: ${error instanceof Error ? error.message : 'unknown error'}. ${ERROR_CALL_TO_ACTION}`,
    )
  }
}

// TODO(kh): I am adding this purely for local staging development.
// We should remove this once we have fixed https://github.com/netlify/cli/blob/b5a5c7525edd28925c5c2e3e5f0f00c4261eaba5/src/lib/build.ts#L125
// A `testOpts.host` is the staging or production API, or a local test server.
const getTestExtensionApiBaseUrl = function (testHost: string | undefined): string | undefined {
  if (!testHost) {
    return
  }

  if (testHost.includes(NETLIFY_API_STAGING_HOSTNAME)) {
    return EXTENSION_API_STAGING_BASE_URL
  }

  if (testHost.includes(NETLIFY_API_HOSTNAME)) {
    return EXTENSION_API_BASE_URL
  }

  return `http://${testHost}`
}
