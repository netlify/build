import { NetlifyAPI } from 'netlify'
import fetch from 'node-fetch'

import { getEnvelope } from '../env/envelope.js'
import { throwUserError } from '../error.js'
import { ERROR_CALL_TO_ACTION } from '../log/messages.js'
import { IntegrationResponse } from '../types/api.js'
import { ModeOption, TestOptions } from '../types/options.js'

type GetSiteInfoOpts = {
  siteId: string
  mode: ModeOption
  siteFeatureFlagPrefix: string
  offline?: boolean
  api?: NetlifyAPI
  context?: string
  featureFlags?: Record<string, boolean>
  testOpts?: TestOptions
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
  mode,
  siteFeatureFlagPrefix,
  context,
  offline = false,
  testOpts = {},
}: GetSiteInfoOpts) {
  const { env: testEnv = false } = testOpts

  if (api === undefined || mode === 'buildbot' || testEnv) {
    const siteInfo = siteId === undefined ? {} : { id: siteId }

    const integrations = mode === 'buildbot' && !offline ? await getIntegrations({ siteId, testOpts, offline }) : []

    return { siteInfo, accounts: [], addons: [], integrations }
  }

  const promises = [
    getSite(api, siteId, siteFeatureFlagPrefix),
    getAccounts(api),
    getAddons(api, siteId),
    getIntegrations({ siteId, testOpts, offline }),
  ]

  const [siteInfo, accounts, addons, integrations] = await Promise.all(promises)

  if (siteInfo.use_envelope) {
    const envelope = await getEnvelope({ api, accountId: siteInfo.account_slug, siteId, context })

    siteInfo.build_settings.env = envelope
  }

  return { siteInfo, accounts, addons, integrations }
}

const getSite = async function (api: NetlifyAPI, siteId: string, siteFeatureFlagPrefix: string | null = null) {
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
  testOpts: TestOptions
  offline: boolean
}

const getIntegrations = async function ({
  siteId,
  testOpts,
  offline,
}: GetIntegrationsOpts): Promise<IntegrationResponse[]> {
  if (!siteId || offline) {
    return []
  }

  const { host } = testOpts

  const baseUrl = new URL(host ? `http://${host}` : `https://api.netlifysdk.com`)

  try {
    const response = await fetch(`${baseUrl}site/${siteId}/integrations/safe`)

    const integrations = await response.json()
    return Array.isArray(integrations) ? integrations : []
  } catch (error) {
    // for now, we'll just ignore errors, as this is early days
    return []
  }
}
