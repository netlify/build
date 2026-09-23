import type { NetlifyAPI } from '@netlify/api'

// Cancel builds, for example when a plugin uses `utils.build.cancelBuild()`
export const cancelBuild = async function ({
  api,
  deployId,
}: {
  api: Pick<NetlifyAPI, 'cancelSiteDeploy'> | undefined
  deployId: string | undefined
}) {
  if (api === undefined || !deployId) {
    return
  }

  await api.cancelSiteDeploy({ deploy_id: deployId })
}
