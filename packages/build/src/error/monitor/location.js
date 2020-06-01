// Retrieve plugin's location and build logs
const getLocationMetadata = function(location, envMetadata) {
  const buildLogs = getBuildLogs(envMetadata)

  if (buildLogs === undefined && location === undefined) {
    return
  }

  return { buildLogs, ...location }
}

// Retrieve the URL to the build logs
const getBuildLogs = function({ DEPLOY_URL, DEPLOY_ID }) {
  const siteName = getSiteName(DEPLOY_URL)

  if (siteName === undefined) {
    return
  }

  return `${NETLIFY_ORIGIN}/sites/${siteName}/deploys/${DEPLOY_ID}`
}

// Retrieve the site's name using the `DEPLOY_URL`
const getSiteName = function(DEPLOY_URL) {
  if (DEPLOY_URL === undefined) {
    return
  }

  const result = DEPLOY_URL_REGEXP.exec(DEPLOY_URL)
  if (result === null) {
    return
  }

  return result[1]
}

const DEPLOY_URL_REGEXP = /^https:\/\/[^-]+--(.*)\.netlify\.app$/
const NETLIFY_ORIGIN = 'https://app.netlify.com'

module.exports = { getLocationMetadata }
