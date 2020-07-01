const { getErrorInfo } = require('./info')
const { getTypeInfo } = require('./type')

// Cancel builds, for example when a plugin uses `utils.build.cancelBuild()`
const cancelBuild = async function({ api, deployId }) {
  if (api === undefined || !deployId) {
    return
  }

  await api.cancelSiteDeploy({ deploy_id: deployId })
}

// Is an exception but not a build error, e.g. canceled builds
const isSuccessException = function(error) {
  const errorInfo = getErrorInfo(error)
  const { isSuccess } = getTypeInfo(errorInfo)
  return Boolean(isSuccess)
}

module.exports = { cancelBuild, isSuccessException }
