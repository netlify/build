import { version as nodeVersion } from 'node:process'

import { getDeployStore } from '@netlify/blobs'
import pMap from 'p-map'
import semver from 'semver'

import { log, logError } from '../../log/logger.js'
import { getBlobsDir } from '../../utils/blobs.js'

import { getKeysToUpload, getFileWithMetadata, anyBlobsToUpload } from './utils.js'

const coreStep = async function ({
  debug,
  logs,
  deployId,
  buildDir,
  quiet,
  constants: { PUBLISH_DIR, SITE_ID, NETLIFY_API_TOKEN, API_URL },
}) {
  const storeOpts: { siteID: string; deployID: string; token: string; apiURL: string; fetch?: any } = {
    siteID: SITE_ID,
    deployID: deployId,
    token: NETLIFY_API_TOKEN,
    apiURL: API_URL,
  }
  if (semver.lt(nodeVersion, '18.0.0')) {
    const nodeFetch = await import('node-fetch')
    storeOpts.fetch = nodeFetch.default
  }

  const blobStore = getDeployStore(storeOpts)
  const blobsDir = getBlobsDir({ buildDir, publishDir: PUBLISH_DIR })
  const keys = await getKeysToUpload(blobsDir)

  // We checked earlier, but let's be extra safe
  if (keys.length === 0) {
    if (!quiet) {
      log(logs, 'No blobs to upload to deploy store.')
    }
    return {}
  }

  if (!quiet) {
    log(logs, `Uploading ${keys.length} blobs to deploy store...`)
  }

  const uploadBlob = async (key) => {
    if (debug && !quiet) {
      log(logs, `- Uploading blob ${key}`, { indent: true })
    }
    const { data, metadata } = await getFileWithMetadata(blobsDir, key)
    await blobStore.set(key, data, { metadata })
  }

  try {
    await pMap(keys, uploadBlob, { concurrency: 10 })
  } catch (err) {
    logError(logs, `Error uploading blobs to deploy store: ${err.message}`)

    throw new Error(`Failed while uploading blobs to deploy store`)
  }

  if (!quiet) {
    log(logs, `Done uploading blobs to deploy store.`)
  }

  return {}
}

const deployAndBlobsPresent = async function ({ deployId, buildDir, constants: { PUBLISH_DIR } }): Promise<boolean> {
  return deployId && (await anyBlobsToUpload({ buildDir, publishDir: PUBLISH_DIR }))
}

export const uploadBlobs = {
  event: 'onPostBuild',
  coreStep,
  coreStepId: 'blobs_upload',
  coreStepName: 'Uploading blobs',
  coreStepDescription: () => 'Uploading blobs to deploy store',
  condition: deployAndBlobsPresent,
}
