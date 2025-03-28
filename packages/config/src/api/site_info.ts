import { NetlifyAPI } from 'netlify'
import fetch from 'node-fetch'
import type { RequestInit } from 'node-fetch'

import { getEnvelope } from '../env/envelope.js'
import { throwUserError } from '../error.js'
import {
  EXTENSION_API_BASE_URL,
  EXTENSION_API_STAGING_BASE_URL,
  NETLIFY_API_BASE_URL,
  NETLIFY_API_STAGING_BASE_URL,
} from '../integrations.js'
import { ERROR_CALL_TO_ACTION } from '../log/messages.js'
import { IntegrationResponse } from '../types/api.js'
import { ModeOption, TestOptions } from '../types/options.js'

type GetSiteInfoOpts = {
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
}: GetSiteInfoOpts) {
  const { env: testEnv = false } = testOpts

  if (api === undefined || mode === 'buildbot' || testEnv) {
    const siteInfo: { id?: string; account_id?: string } = {}

    if (siteId !== undefined) siteInfo.id = siteId
    if (accountId !== undefined) siteInfo.account_id = accountId

    const integrations =
      mode === 'buildbot' && !offline
        ? await getIntegrations({
            siteId,
            testOpts,
            offline,
            accountId,
            token,
            featureFlags,
            extensionApiBaseUrl,
            mode,
          })
        : []

    return { siteInfo, accounts: [], addons: [], integrations }
  }

  const promises = [
    getSite(api, siteId, siteFeatureFlagPrefix),
    getAccounts(api),
    getAddons(api, siteId),
    getIntegrations({ siteId, testOpts, offline, accountId, token, featureFlags, extensionApiBaseUrl, mode }),
  ]

  const [siteInfo, accounts, addons, integrations] = await Promise.all(promises)

  if (siteInfo.use_envelope) {
    const envelope = await getEnvelope({ api, accountId: siteInfo.account_slug, siteId, context })

    siteInfo.build_settings.env = envelope
  }

  return { siteInfo, accounts, addons, integrations }
}

const getSite = async function (api: NetlifyAPI, siteId: string, siteFeatureFlagPrefix: string) {
  if (siteId === undefined) {
    return {}
  }

  try {
    const site = await (api as any).getSite({ siteId, feature_flags: siteFeatureFlagPrefix })
    return { ...site, id: siteId }
  } catch (error) {
    throwUserError(`Failed retrieving site data for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const getAccounts = async function (api: NetlifyAPI) {
  try {
    const accounts = await (api as any).listAccountsForUser()
    return Array.isArray(accounts) ? accounts : []
  } catch (error) {
    throwUserError(`Failed retrieving user account: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const getAddons = async function (api: NetlifyAPI, siteId: string) {
  if (siteId === undefined) {
    return []
  }

  try {
    const addons = await (api as any).listServiceInstancesForSite({ siteId })
    return Array.isArray(addons) ? addons : []
  } catch (error) {
    throwUserError(`Failed retrieving addons for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

type GetIntegrationsOpts = {
  siteId?: string
  accountId?: string
  testOpts: TestOptions
  offline: boolean
  token?: string
  featureFlags?: Record<string, boolean>
  extensionApiBaseUrl: string
  mode: ModeOption
}

const getIntegrations = async function ({
  siteId,
  accountId,
  testOpts,
  offline,
  token,
  featureFlags,
  extensionApiBaseUrl,
  mode,
}: GetIntegrationsOpts): Promise<IntegrationResponse[]> {
  if (!siteId || offline) {
    return []
  }
  const sendBuildBotTokenToJigsaw = featureFlags?.send_build_bot_token_to_jigsaw
  const { host: originalHost, setBaseUrl } = testOpts

  // TODO(kh): I am adding this purely for local staging development.
  // We should remove this once we have fixed https://github.com/netlify/cli/blob/b5a5c7525edd28925c5c2e3e5f0f00c4261eaba5/src/lib/build.ts#L125
  let host = originalHost

  // If there is a host, we use it to fetch the integrations
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
    const requestOptions = {} as RequestInit

    // This is used to identify where the request is coming from
    requestOptions.headers = {
      'netlify-config-mode': mode,
    }

    if (sendBuildBotTokenToJigsaw && token) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'netlify-sdk-build-bot-token': token,
      }
    }

    const response = await fetch(url, requestOptions)
    if (!response.ok) {
      throw new Error(`Unexpected status code ${response.status} from fetching extensions`)
    }
    const bodyText = await response.text()
    if (bodyText === '') {
      return []
    }

    const integrations = await JSON.parse(bodyText)
    return Array.isArray(integrations) ? integrations : []
  } catch (error) {
    return throwUserError(`Failed retrieving extensions for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}
