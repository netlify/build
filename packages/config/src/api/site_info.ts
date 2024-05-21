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
  //featureFlags?: Record<string, boolean>
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

  if (api === undefined || testEnv || offline) {
    const siteInfo = siteId === undefined ? {} : { id: siteId }

    return { siteInfo, accounts: [], addons: [], integrations: [] }
  }

  const siteInfo = await getSite(api, siteId, siteFeatureFlagPrefix)
  const featureFlags = siteInfo.feature_flags

  const useV1Endpoint = !featureFlags?.cli_integration_installations_meta

  if (useV1Endpoint) {
    if (mode === 'buildbot') {
      const siteInfo = siteId === undefined ? {} : { id: siteId }

      const integrations = await getIntegrations({ siteId, testOpts, offline, featureFlags })

      return { siteInfo, accounts: [], addons: [], integrations }
    }

    const promises = [
      getAccounts(api),
      getAddons(api, siteId),
      getIntegrations({ siteId, testOpts, offline, featureFlags }),
    ]

    const [accounts, addons, integrations] = await Promise.all(promises)

    if (siteInfo.use_envelope) {
      const envelope = await getEnvelope({ api, accountId: siteInfo.account_slug, siteId, context })

      siteInfo.build_settings.env = envelope
    }

    return { siteInfo, accounts, addons, integrations }
  } else {
    const promises = [
      getAccounts(api),
      getAddons(api, siteId),
      getIntegrations({ siteId, testOpts, offline, accountId: siteInfo.account_id, featureFlags }),
    ]

    const [accounts, addons, integrations] = await Promise.all(promises)

    if (siteInfo.use_envelope) {
      const envelope = await getEnvelope({ api, accountId: siteInfo.account_slug, siteId, context })

      siteInfo.build_settings.env = envelope
    }

    return { siteInfo, accounts, addons, integrations }
  }
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
    // Added to satisfy TypeScript only an object can be returned
    return { id: siteId }
  }
}

const getAccounts = async function (api: NetlifyAPI) {
  try {
    const accounts = await (api as any).listAccountsForUser()
    return Array.isArray(accounts) ? accounts : []
  } catch (error) {
    throwUserError(`Failed retrieving user account: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
    // Added to satisfy TypeScript only an array can be returned
    return []
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
    // Added to satisfy TypeScript only an array can be returned
    return []
  }
}

type GetIntegrationsOpts = {
  siteId?: string
  accountId?: string
  testOpts: TestOptions
  offline: boolean
  featureFlags?: Record<string, boolean>
}

const getIntegrations = async function ({
  siteId,
  accountId,
  testOpts,
  offline,
  featureFlags,
}: GetIntegrationsOpts): Promise<IntegrationResponse[]> {
  if (!siteId || offline) {
    return []
  }

  const { host } = testOpts

  const baseUrl = new URL(host ? `http://${host}` : `https://api.netlifysdk.com`)

  const useV1Endpoint = !featureFlags?.cli_integration_installations_meta

  const url = useV1Endpoint
    ? `${baseUrl}site/${siteId}/integrations/safe`
    : `${baseUrl}team/${accountId}/integrations/installations/meta`

  try {
    const response = await fetch(url)

    const integrations = await response.json()
    return Array.isArray(integrations) ? integrations : []
  } catch (error) {
    // Integrations should not block the build if they fail to load
    // TODO: We should consider blocking the build as integrations are a critical part of the build process
    return []
  }
}
