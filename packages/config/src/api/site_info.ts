import { NetlifyAPI } from '@netlify/api'

import { getEnvelope } from '../env/envelope.js'
import { throwUserError } from '../error.js'
import {
  EXTENSION_API_BASE_URL,
  EXTENSION_API_STAGING_BASE_URL,
  NETLIFY_API_BASE_URL,
  NETLIFY_API_STAGING_BASE_URL,
} from '../extensions.js'
import { ERROR_CALL_TO_ACTION } from '../log/messages.js'
import { ExtensionResponse } from '../types/api.js'
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

export type SiteInfo = {
  accounts: MinimalAccount[]
  extensions: ExtensionResponse[]
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
  if (siteId !== undefined) {
    try {
      const site = await api.getSite({
        // @ts-expect-error: Internal parameter that instructs the API to include all the site's
        // feature flags in the response.
        feature_flags: siteFeatureFlagPrefix,
        siteId,
      })
      return { ...site, id: siteId }
    } catch (err) {
      throwUserError(`Failed retrieving site data for site ${siteId}: ${err.message}. ${ERROR_CALL_TO_ACTION}`)
    }
  }

  return {}
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
}: GetExtensionsOptions): Promise<ExtensionResponse[]> {
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

  try {
    const headers = new Headers({
      'Netlify-Config-Mode': mode,
      'User-Agent': `Netlify Config (mode:${mode}) / ${ROOT_PACKAGE_JSON.version}`,
    })
    if (sendBuildBotTokenToJigsaw && token) {
      headers.set('Netlify-SDK-Build-Bot-Token', token)
    }
    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`Unexpected status code ${response.status} from fetching extensions`)
    }
    const bodyText = await response.text()
    if (bodyText === '') {
      return []
    }

    const extensions = await JSON.parse(bodyText)
    return Array.isArray(extensions) ? extensions : []
  } catch (err: unknown) {
    return throwUserError(
      `Failed retrieving extensions for site ${siteId}: ${err instanceof Error ? err.message : 'unknown error'}. ${ERROR_CALL_TO_ACTION}`,
    )
  }
}
