const {
  env: { BUILD_SITE_INFO },
} = require('process')

const NetlifyAPI = require('netlify')

const isNetlifyCI = require('../utils/is-netlify-ci')

// Retrieve Netlify Site information, if availabled.
// This is only used for local builds environment variables at the moment.
const getSiteInfo = async function(token, id) {
  if (token === undefined || id === undefined || isNetlifyCI()) {
    return { id }
  }

  const api = new NetlifyAPI(token)
  const siteInfo = await getSite(id, api)
  return { ...siteInfo, id }
}

const getSite = async function(site_id, api) {
  try {
    // Used for testing.
    // TODO: find a better method not to pollute source code with test mocking.
    if (BUILD_SITE_INFO !== undefined) {
      return JSON.parse(BUILD_SITE_INFO)
    }

    return await api.getSite({ site_id })
    // Silently ignore errors. For example the network connection might be down,
    // but local builds should still work regardless.
  } catch (error) {
    return {}
  }
}

module.exports = { getSiteInfo }
