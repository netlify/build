'use strict'

// Retrieve Netlify Site information, if availabled.
// Used to retrieve local build environment variables and UI build settings.
// This is not used in production builds since the buildbot passes this
// information instead.
// Requires knowing the `siteId` and having the access `token`.
const getSiteInfo = async function (api, siteId, mode) {
  if (siteId === undefined) {
    return {}
  }
  if (api === undefined || mode === 'buildbot') {
    return { id: siteId }
  }

  const siteInfo = await getSite(siteId, api)
  return { ...siteInfo, id: siteId }
}

const getSite = async function (siteId, api) {
  try {
    return await api.getSite({ site_id: siteId })
    // Silently ignore errors. For example the network connection might be down,
    // but local builds should still work regardless.
  } catch (error) {
    return {}
  }
}

module.exports = { getSiteInfo }
