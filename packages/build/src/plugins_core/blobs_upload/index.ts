import { version as nodeVersion } from 'node:process'

import { getDeployStore } from '@netlify/blobs'
import pMap from 'p-map'
import semver from 'semver'

import { log, logError } from '../../log/logger.js'
import { anyBlobsToUpload, getBlobsDir } from '../../utils/blobs.js'
import { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'

import { getKeysToUpload, getFileWithMetadata } from './utils.js'

const coreStep: CoreStepFunction = async function ({
  debug,
  logs,
  deployId,
  buildDir,
  quiet,
  packagePath,
  constants: { SITE_ID, NETLIFY_API_TOKEN, NETLIFY_API_HOST },
}) {
  // This should never happen due to the condition check
  if (!deployId || !NETLIFY_API_TOKEN || !NETLIFY_API_HOST) {
    return {}
  }

  const storeOpts: { siteID: string; deployID: string; token: string; apiURL: string; fetch?: any } = {
    siteID: SITE_ID,
    deployID: deployId,
    token: NETLIFY_API_TOKEN,
    apiURL: NETLIFY_API_HOST,
  }
  if (semver.lt(nodeVersion, '18.0.0')) {
    const nodeFetch = await import('node-fetch')
    storeOpts.fetch = nodeFetch.default
  }

  const blobStore = getDeployStore(storeOpts)
  const blobsDir = getBlobsDir(buildDir, packagePath)
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

const deployAndBlobsPresent: CoreStepCondition = async ({ deployId, buildDir, packagePath }) =>
  Boolean(deployId && (await anyBlobsToUpload(buildDir, packagePath)))

export const uploadBlobs: CoreStep = {
  event: 'onPostBuild',
  coreStep,
  coreStepId: 'blobs_upload',
  coreStepName: 'Uploading blobs',
  coreStepDescription: () => 'Uploading blobs to deploy store',
  condition: deployAndBlobsPresent,
}
