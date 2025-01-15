import { NetlifyAPI } from 'netlify'
import fetch from 'node-fetch'

import { getEnvelope } from '../env/envelope.js'
import { throwUserError } from '../error.js'
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
  featureFlags = {},
}: GetSiteInfoOpts) {
  const { env: testEnv = false } = testOpts
  const errorOnExtensionFetchFail = featureFlags.error_builds_on_extension_fetch_fail
  console.log(`Fetching site info for site ${siteId}`, {
    siteId,
    accountId,
    mode,
    offline,
    testEnv,
    errorOnExtensionFetchFail,
  })
  console.log(`Feature flags: ${JSON.stringify(featureFlags, null, 2)}`)

  if (api === undefined || mode === 'buildbot' || testEnv) {
    const siteInfo: { id?: string; account_id?: string } = {}

    if (siteId !== undefined) siteInfo.id = siteId
    if (accountId !== undefined) siteInfo.account_id = accountId

    const integrations =
      mode === 'buildbot' && !offline
        ? await getIntegrations({ siteId, testOpts, offline, accountId, errorOnExtensionFetchFail })
        : []

    return { siteInfo, accounts: [], addons: [], integrations }
  }

  const promises = [
    getSite(api, siteId, siteFeatureFlagPrefix),
    getAccounts(api),
    getAddons(api, siteId),
    getIntegrations({ siteId, testOpts, offline, accountId, errorOnExtensionFetchFail }),
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
  errorOnExtensionFetchFail?: boolean
}

const getIntegrations = async function ({
  siteId,
  accountId,
  testOpts,
  offline,
  errorOnExtensionFetchFail,
}: GetIntegrationsOpts): Promise<IntegrationResponse[]> {
  if (!siteId || offline) {
    return []
  }

  const { host } = testOpts

  const baseUrl = new URL(host ? `http://${host}` : `https://api.netlifysdk.com`)

  // if accountId isn't present, use safe v1 endpoint
  const url = accountId
    ? `${baseUrl}team/${accountId}/integrations/installations/meta/${siteId}`
    : `${baseUrl}site/${siteId}/integrations/safe`

  if (errorOnExtensionFetchFail) {
    try {
      const response = await fetch(url)
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
      return throwUserError(
        `Failed retrieving extensions for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`,
      )
    }
  }

  try {
    const response = await fetch(url)
    const integrations = await response.json()
    return Array.isArray(integrations) ? integrations : []
  } catch (error) {
    return []
  }
}
