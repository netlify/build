const {
  env: { DEPLOY_ID },
} = require('process')

const { getErrorInfo } = require('./info')

// Cancel builds, for example when a plugin uses `utils.build.cancelBuild()`
const maybeCancelBuild = async function(error, api) {
  if (api === undefined || !DEPLOY_ID) {
    return
  }

  const { type } = getErrorInfo(error)

  if (type !== 'cancelBuild') {
    return
  }

  await api.cancelSiteDeploy({ deploy_id: DEPLOY_ID })
}

module.exports = { maybeCancelBuild }
