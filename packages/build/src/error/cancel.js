const {
  env: { DEPLOY_ID },
} = require('process')

const { getErrorInfo } = require('./info')
const { getTypeInfo } = require('./type')

// Handle top-level build errors.
// Logging is done separately.
const maybeCancelBuild = async function(error, api) {
  const errorInfo = getErrorInfo(error)
  const { shouldCancel } = getTypeInfo(errorInfo)
  await cancelBuild(shouldCancel, api)
}

// Cancel builds, for example when a plugin uses `utils.build.cancelBuild()`
const cancelBuild = async function(shouldCancel, api) {
  if (!shouldCancel || api === undefined || !DEPLOY_ID) {
    return
  }

  await api.cancelSiteDeploy({ deploy_id: DEPLOY_ID })
}

module.exports = { maybeCancelBuild }
