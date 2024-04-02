import { getDeployStore } from '@netlify/blobs'

export const onPreBuild = async function () {
  const store = getDeployStore()

  console.log(await store.get("my-key"))
}
