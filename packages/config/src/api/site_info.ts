import { NetlifyAPI } from 'netlify'
import fetch from 'node-fetch'
import type { RequestInit } from 'node-fetch'

import { getEnvelope } from '../env/envelope.js'
import { throwUserError } from '../error.js'
import { ERROR_CALL_TO_ACTION } from '../log/messages.js'
import { IntegrationResponse } from '../types/api.js'
import { ModeOption, TestOptions } from '../types/options.js'
import retry from "retry"

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
}: GetSiteInfoOpts) {
  const { env: testEnv = false } = testOpts

  if (api === undefined || mode === 'buildbot' || testEnv) {
    const siteInfo: { id?: string; account_id?: string } = {}

    if (siteId !== undefined) siteInfo.id = siteId
    if (accountId !== undefined) siteInfo.account_id = accountId

    const integrations =
      mode === 'buildbot' && !offline
        ? await getIntegrations({ siteId, testOpts, offline, accountId, token, featureFlags })
        : []

    return { siteInfo, accounts: [], addons: [], integrations }
  }

  const promises = [
    getSite(api, siteId, siteFeatureFlagPrefix),
    getAccounts(api),
    getAddons(api, siteId),
    getIntegrations({ siteId, testOpts, offline, accountId, token, featureFlags }),
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
}

const getIntegrations = async function ({
  siteId,
  accountId,
  testOpts,
  offline,
  token,
  featureFlags,
}: GetIntegrationsOpts): Promise<IntegrationResponse[]> {
  if (!siteId || offline) {
    return []
  }
  const sendBuildBotTokenToJigsaw = featureFlags?.send_build_bot_token_to_jigsaw
  const { host } = testOpts

  const baseUrl = new URL(host ? `http://${host}` : `https://api.netlifysdk.com`)

  // if accountId isn't present, use safe v1 endpoint
  const url = accountId
    ? `${baseUrl}team/${accountId}/integrations/installations/meta/${siteId}`
    : `${baseUrl}site/${siteId}/integrations/safe`

  try {
    const requestOptions = {} as RequestInit

    if (sendBuildBotTokenToJigsaw && token) {
      requestOptions.headers = {
        'netlify-sdk-build-bot-token': token,
      }
    }

    const MAX_RETRY = 3

    const retryOperation = retry.operation({
      retries: MAX_RETRY,
      minTimeout: 1 * 500,
      maxTimeout: 5 * 1000,
    })

    let bodyText

    retryOperation.attempt(async () => {
      const response = await fetch(url, requestOptions)
      if (!response.ok) {
        throw new Error(`Unexpected status code ${response.status} from fetching extensions`)
      }
      
      bodyText = await response.text()
    })
    
    if (bodyText === '') {
      return []
    }
    const integrations = await JSON.parse(bodyText)
    return Array.isArray(integrations) ? integrations : []
  } catch (error) {
    return throwUserError(`Failed retrieving extensions for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}
