'use strict'

const { throwError } = require('../error')

// Retrieve Netlify Site information, if available.
// Used to retrieve local build environment variables and UI build settings.
// This is not used in production builds since the buildbot passes this
// information instead.
// Requires knowing the `siteId` and having the access `token`.
// Silently ignore API errors. For example the network connection might be down,
// but local builds should still work regardless.
const getSiteInfo = async function ({ api, siteId, mode, testOpts: { env: testEnv = true } = {} }) {
  if (api === undefined || mode === 'buildbot' || !testEnv) {
    const siteInfo = siteId === undefined ? {} : { id: siteId }
    return { siteInfo, accounts: [], addons: [] }
  }

  const [siteInfo, accounts, addons] = await Promise.all([
    getSite(api, siteId),
    getAccounts(api),
    getAddons(api, siteId),
  ])
  return { siteInfo, accounts, addons }
}

const getSite = async function (api, siteId) {
  if (siteId === undefined) {
    return {}
  }

  try {
    const site = await api.getSite({ siteId })
    return { ...site, id: siteId }
  } catch (error) {
    throwError(`Failed retrieving site data for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const getAccounts = async function (api) {
  try {
    const accounts = await api.listAccountsForUser()
    return Array.isArray(accounts) ? accounts : []
  } catch (error) {
    throwError(`Failed retrieving user account: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
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
    throwError(`Failed retrieving addons for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}

const ERROR_CALL_TO_ACTION = `Double-check your login status with 'netlify status' or contact support with details of your error.`

module.exports = { getSiteInfo }
