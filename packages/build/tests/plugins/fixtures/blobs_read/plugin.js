import { version as nodeVersion } from "process"

import { getDeployStore } from '@netlify/blobs'
import semver from 'semver'

export const onPreBuild = async function () {
  const storeOptions = {}

  if (semver.lt(nodeVersion, '18.0.0')) {
    const nodeFetch = await import('node-fetch')
    storeOptions.fetch = nodeFetch.default
  }

  const store = getDeployStore(storeOptions)

  console.log(await store.get("my-key"))
}
