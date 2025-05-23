import { getDeployStore } from '@netlify/blobs'

export const onPreBuild = async function ({netlifyConfig}) {
  const storeOptions = {}

  const store = getDeployStore(storeOptions)
  const value = await store.get("my-key")

  netlifyConfig.build.command = `echo "${value}"`
}
