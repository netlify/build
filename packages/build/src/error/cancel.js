// Cancel builds, for example when a plugin uses `utils.build.cancelBuild()`
export const cancelBuild = async function ({ api, deployId }) {
  if (api === undefined || !deployId) {
    return
  }

  await api.cancelSiteDeploy({ deploy_id: deployId })
}
