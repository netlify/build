import { version as nodeVersion } from "process"

import { getDeployStore } from '@netlify/blobs'
import semver from 'semver'

export const onPreBuild = async function () {
  const storeOptions = {}

  if (semver.lt(nodeVersion, '18.0.0')) {
    storeOptions.fetch = await import('node-fetch').default
  }

  const store = getDeployStore(storeOptions)

  console.log(await store.get("my-key"))
}
