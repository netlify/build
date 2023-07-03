import fetch from 'node-fetch'

import { getEnvelope } from '../env/envelope.js'
import { throwUserError } from '../error.js'
import { ERROR_CALL_TO_ACTION } from '../log/messages.js'

// Retrieve Netlify Site information, if available.
// Used to retrieve local build environment variables and UI build settings.
// This is not used in production builds since the buildbot passes this
// information instead.
// Requires knowing the `siteId` and having the access `token`.
// Silently ignore API errors. For example the network connection might be down,
// but local builds should still work regardless.

export const getSiteInfo = async function ({
  api,
  siteId,
  mode,
  siteFeatureFlagPrefix,
  testOpts: { env: testEnv = true } = {},
}) {
  if (api === undefined || mode === 'buildbot' || !testEnv) {
    const siteInfo = siteId === undefined ? {} : { id: siteId }
    return { siteInfo, accounts: [], addons: [] }
  }

  const [siteInfo, accounts, addons, integrations] = await Promise.all([
    getSite(api, siteId, siteFeatureFlagPrefix),
    getAccounts(api),
    getAddons(api, siteId),
    getIntegrations(api, siteId),
  ])

  if (siteInfo.use_envelope) {
    const envelope = await getEnvelope({ api, accountId: siteInfo.account_slug, siteId })

    siteInfo.build_settings.env = envelope
  }

  return { siteInfo, accounts, addons, integrations }
}

const getSite = async function (api, siteId, siteFeatureFlagPrefix = null) {
  if (siteId === undefined) {
    return {}
  }

  try {
    const site = await api.getSite({ siteId, feature_flags: siteFeatureFlagPrefix })
    return { ...site, id: siteId }
  } catch (error) {
    throwUserError(`Failed retrieving site data for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const getAccounts = async function (api) {
  try {
    const accounts = await api.listAccountsForUser()
    return Array.isArray(accounts) ? accounts : []
  } catch (error) {
    throwUserError(`Failed retrieving user account: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const getAddons = async function (api, siteId) {
  if (siteId === undefined) {
    return []
  }

  try {
    const addons = await api.listServiceInstancesForSite({ siteId })
    return Array.isArray(addons) ? addons : []
  } catch (error) {
    throwUserError(`Failed retrieving addons for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const getIntegrations = async function (api, siteId) {
  if (siteId === undefined) {
    return []
  }

  return [
    {
      slug: 'sentry',
      version: 'http://localhost:8888',
      has_build: true,
    },
  ]

  //   try {
  //     const token = api.accessToken()
  //     const response = await fetch(`https://app.netlify.com/sites/${siteId}/integrations`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })

  //     const integrations = await response.json()
  //     return Array.isArray(integrations) ? integrations : []
  //   } catch (error) {
  //     throwUserError(`Failed retrieving integrations for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  //   }
}
