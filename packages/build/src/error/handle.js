const {
  env: { DEPLOY_ID },
} = require('process')

const { getTypeInfo } = require('./type')

// Handle top-level build errors.
// Logging is done separately.
const handleBuildError = async function(error, api) {
  const { shouldCancel } = getTypeInfo(error)
  await cancelBuild(shouldCancel, api)
}

// Cancel builds, for example when a plugin uses `utils.build.cancel()`
const cancelBuild = async function(shouldCancel, api) {
  if (!shouldCancel || api === undefined || !DEPLOY_ID) {
    return
  }

  await api.cancelSiteDeploy({ deploy_id: DEPLOY_ID })
}

module.exports = { handleBuildError }
