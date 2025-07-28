import { NetlifyAPI } from '@netlify/api'

import * as z from 'zod'

import { getEnvelope } from '../env/envelope.js'
import { throwUserError } from '../error.js'
import {
  EXTENSION_API_BASE_URL,
  EXTENSION_API_STAGING_BASE_URL,
  NETLIFY_API_BASE_URL,
  NETLIFY_API_STAGING_BASE_URL,
} from '../extensions.js'
import { ERROR_CALL_TO_ACTION } from '../log/messages.js'
import { ModeOption, TestOptions } from '../types/options.js'
import { ROOT_PACKAGE_JSON } from '../utils/json.js'

type GetSiteInfoOptions = {
  siteId: string
  accountId?: string
  mode: ModeOption
  offline?: boolean
  api?: NetlifyAPI
  context?: string
  featureFlags?: Record<string, boolean>
  testOpts?: TestOptions
  siteFeatureFlagPrefix: string
  token: string
  extensionApiBaseUrl: string
}

export type Extension = {
  author: string | undefined
  extension_token: string | undefined
  has_build: boolean
  name: string
  slug: string
  version: string
}

export type SiteInfo = {
  accounts: MinimalAccount[]
  extensions: Extension[]
  siteInfo: Awaited<ReturnType<NetlifyAPI['getSite']>> & {
    feature_flags?: Record<string, string | number | boolean>
    use_envelope?: boolean
  }
}

/**
 * Retrieve Netlify Site information, if available.
 * Used to retrieve local build environment variables and UI build settings.
 * This is not used in production builds since the buildbot passes this
 * information instead.
 * Requires knowing the `siteId` and having the access `token`.
 * Silently ignore API errors. For example the network connection might be down,
 * but local builds should still work regardless.
 */
export const getSiteInfo = async function ({
  api,
  siteId,
  accountId,
  mode,
  context,
  offline = false,
  testOpts = {},
  siteFeatureFlagPrefix,
  token,
  featureFlags = {},
  extensionApiBaseUrl,
}: GetSiteInfoOptions): Promise<SiteInfo> {
  const { env: testEnv = false } = testOpts

  if (api === undefined || mode === 'buildbot' || testEnv) {
    const siteInfo: SiteInfo['siteInfo'] = {}

    if (siteId !== undefined) {
      siteInfo.id = siteId
    }
    if (accountId !== undefined) {
      siteInfo.account_id = accountId
    }

    let extensions: SiteInfo['extensions'] = []
    if (mode === 'buildbot' && !offline) {
      extensions = await getExtensions({
        siteId,
        testOpts,
        offline,
        accountId,
        token,
        featureFlags,
        extensionApiBaseUrl,
        mode,
      })
    }

    return { accounts: [], extensions, siteInfo }
  }

  const [siteInfo, accounts, extensions] = await Promise.all([
    getSite(api, siteId, siteFeatureFlagPrefix),
    getAccounts(api),
    getExtensions({ siteId, testOpts, offline, accountId, token, featureFlags, extensionApiBaseUrl, mode }),
  ])

  // TODO(ndhoule): Investigate, but at this point, I'm fairly sure this is the default for all
  // sites. If so, we can remove this conditional and always query for environment variables.
  if (siteInfo.use_envelope) {
    const envelope = await getEnvelope({ api, accountId: siteInfo.account_slug!, siteId, context })

    siteInfo.build_settings!.env = envelope
  }

  return { siteInfo, accounts, extensions }
}

const getSite = async function (
  api: NetlifyAPI,
  siteId: string,
  siteFeatureFlagPrefix: string,
): Promise<SiteInfo['siteInfo']> {
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
  } catch (err) {
    return throwUserError(`Failed retrieving site data for site ${siteId}: ${err.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

export type MinimalAccount = {
  id: string
  name: string
  slug: string
  default: boolean
  team_logo_url: string | null
  on_pro_trial: boolean
  organization_id: string | null
  type_name: string
  type_slug: string
  members_count: number
}

const getAccounts = async function (api: NetlifyAPI): Promise<MinimalAccount[]> {
  try {
    const accounts = (await api.listAccountsForUser(
      // @ts-expect-error(ndhoule): This is an unpublished, internal querystring parameter
      { minimal: 'true' },
    )) as MinimalAccount[] | null
    return Array.isArray(accounts) ? (accounts as MinimalAccount[]) : []
  } catch (error) {
    return throwUserError(`Failed retrieving user account: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

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
    author: z.string().optional().default(undefined),
    extension_token: z.string().optional().default(undefined),
    has_build: z.boolean(),
    name: z.string(),
    slug: z.string(),
    version: z.string(),

    // Returned by API, but unused. Leaving this here for the sake of documentation.
    // has_connector: z.boolean(),
  }),
)

export type ExtensionResponse = z.output<typeof ExtensionResponseSchema>

type GetExtensionsOptions = {
  siteId?: string
  accountId?: string
  testOpts: TestOptions
  offline: boolean
  token?: string
  featureFlags?: Record<string, boolean>
  extensionApiBaseUrl: string
  mode: ModeOption
}

export const getExtensions = async function ({
  siteId,
  accountId,
  testOpts,
  offline,
  token,
  featureFlags,
  extensionApiBaseUrl,
  mode,
}: GetExtensionsOptions): Promise<Extension[]> {
  if (!siteId || offline) {
    return []
  }
  const sendBuildBotTokenToJigsaw = featureFlags?.send_build_bot_token_to_jigsaw
  const { host: originalHost, setBaseUrl } = testOpts

  // TODO(kh): I am adding this purely for local staging development.
  // We should remove this once we have fixed https://github.com/netlify/cli/blob/b5a5c7525edd28925c5c2e3e5f0f00c4261eaba5/src/lib/build.ts#L125
  let host = originalHost

  // If there is a host, we use it to fetch the extensions
  // we check if the host is staging or production and set the host accordingly,
  // sadly necessary because of https://github.com/netlify/cli/blob/b5a5c7525edd28925c5c2e3e5f0f00c4261eaba5/src/lib/build.ts#L125
  if (originalHost) {
    if (originalHost?.includes(NETLIFY_API_STAGING_BASE_URL)) {
      host = EXTENSION_API_STAGING_BASE_URL
    } else if (originalHost?.includes(NETLIFY_API_BASE_URL)) {
      host = EXTENSION_API_BASE_URL
    } else {
      host = `http://${originalHost}`
    }
  }

  const baseUrl = new URL(host ?? extensionApiBaseUrl)
  // We only use this for testing
  if (host && setBaseUrl) {
    setBaseUrl(extensionApiBaseUrl)
  }
  // if accountId isn't present, use safe v1 endpoint
  const url = accountId
    ? `${baseUrl}team/${accountId}/integrations/installations/meta/${siteId}`
    : `${baseUrl}site/${siteId}/integrations/safe`
  const headers = new Headers({
    'Netlify-Config-Mode': mode,
    'User-Agent': `Netlify Config (mode:${mode}) / ${ROOT_PACKAGE_JSON.version}`,
  })
  if (sendBuildBotTokenToJigsaw && token) {
    headers.set('Netlify-SDK-Build-Bot-Token', token)
  }

  try {
    const res = await fetch(url, { headers })
    if (res.status !== 200) {
      throw new Error(`Unexpected status code ${res.status} from fetching extensions`)
    }
    return ExtensionResponseSchema.parse(await res.json())
  } catch (err: unknown) {
    return throwUserError(
      `Failed retrieving extensions for site ${siteId}: ${err instanceof Error ? err.message : 'unknown error'}. ${ERROR_CALL_TO_ACTION}`,
    )
  }
}
