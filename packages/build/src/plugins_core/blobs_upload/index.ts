import { version as nodeVersion } from 'node:process'

import { getDeployStore } from '@netlify/blobs'
import pMap from 'p-map'
import semver from 'semver'

import { DEFAULT_API_HOST } from '../../core/normalize_flags.js'
import { log, logError } from '../../log/logger.js'
import { scanForBlobs } from '../../utils/blobs.js'
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
  if (!deployId || !NETLIFY_API_TOKEN) {
    return {}
  }
  // for cli deploys with `netlify deploy --build` the `NETLIFY_API_HOST` is undefined
  const apiHost = NETLIFY_API_HOST || DEFAULT_API_HOST

  const storeOpts: Parameters<typeof getDeployStore>[0] = {
    siteID: SITE_ID,
    deployID: deployId,
    token: NETLIFY_API_TOKEN,
    apiURL: `https://${apiHost}`,
  }

  // If we don't have native `fetch` in the global scope, add a polyfill.
  if (semver.lt(nodeVersion, '18.0.0')) {
    const nodeFetch = await import('node-fetch')

    // @ts-expect-error The types between `node-fetch` and the native `fetch`
    // are not a 100% match, even though the APIs are mostly compatible.
    storeOpts.fetch = nodeFetch.default
  }

  const blobs = await scanForBlobs(buildDir, packagePath)

  // We checked earlier, but let's be extra safe
  if (blobs === null) {
    if (!quiet) {
      log(logs, 'No blobs to upload to deploy store.')
    }
    return {}
  }

  // If using the deploy config API, configure the store to use the region that
  // was configured for the deploy.
  if (!blobs.isLegacyDirectory) {
    storeOpts.experimentalRegion = 'auto'
  }

  const blobStore = getDeployStore(storeOpts)
  const keys = await getKeysToUpload(blobs.directory)

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
    const { data, metadata } = await getFileWithMetadata(blobs.directory, key)
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

const deployAndBlobsPresent: CoreStepCondition = async ({
  deployId,
  buildDir,
  packagePath,
  constants: { NETLIFY_API_TOKEN },
}) => Boolean(NETLIFY_API_TOKEN && deployId && (await scanForBlobs(buildDir, packagePath)))

export const uploadBlobs: CoreStep = {
  event: 'onPostBuild',
  coreStep,
  coreStepId: 'blobs_upload',
  coreStepName: 'Uploading blobs',
  coreStepDescription: () => 'Uploading blobs to deploy store',
  condition: deployAndBlobsPresent,
}
