import { getDeployStore } from '@netlify/blobs'
import pMap from 'p-map'

import { addErrorInfo } from '../../error/info.js'
import { log, logError } from '../../log/logger.js'

import { getKeysToUpload, getBlobsDir, getFileWithMetadata, anyBlobsToUpload } from './utils.js'

const coreStep = async function ({
  debug,
  logs,
  deployId,
  buildDir,
  constants: { PUBLISH_DIR, SITE_ID, NETLIFY_API_TOKEN, API_URL },
}) {
  const blobStore = getDeployStore({ siteID: SITE_ID, deployID: deployId, token: NETLIFY_API_TOKEN, apiURL: API_URL })
  const blobsDir = getBlobsDir({ buildDir, publishDir: PUBLISH_DIR })
  const keys = await getKeysToUpload(blobsDir)

  // We checked earlier, but let's be extra safe
  if (keys.length === 0) {
    log(logs, 'No blobs to upload to deploy store.')
    return {}
  }

  log(logs, `Uploading ${keys.length} blobs to deploy store...`)

  const uploadBlob = async (key) => {
    if (debug) {
      log(logs, `- Uploading blob ${key}`, { indent: true })
    }
    const { data, metadata } = await getFileWithMetadata(blobsDir, key)
    await blobStore.set(key, data, { metadata })
  }

  try {
    await pMap(keys, uploadBlob, { concurrency: 10 })
  } catch (err) {
    logError(logs, `Error uploading blobs to deploy store: ${err.message}`)

    const error = new Error(`Failed while uploading blobs to deploy store`)
    addErrorInfo(error, { type: 'blobsUploadError' })
    throw error
  }

  log(logs, `Done uploading blobs to deploy store.`)

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
