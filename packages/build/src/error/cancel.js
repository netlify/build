const {
  env: { DEPLOY_ID },
} = require('process')

// Cancel builds, for example when a plugin uses `utils.build.cancelBuild()`
const cancelBuild = async function(api) {
  if (api === undefined || !DEPLOY_ID) {
    return
  }

  await api.cancelSiteDeploy({ deploy_id: DEPLOY_ID })
}

module.exports = { cancelBuild }
