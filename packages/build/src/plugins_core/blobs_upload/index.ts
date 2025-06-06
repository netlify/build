import { getDeployStore } from '@netlify/blobs'
import pMap from 'p-map'

import { DEFAULT_API_HOST } from '../../core/normalize_flags.js'
import { logError } from '../../log/logger.js'
import { getFileWithMetadata, getKeysToUpload, scanForBlobs } from '../../utils/blobs.js'
import { getBlobs } from '../../utils/frameworks_api.js'
import { type CoreStep, type CoreStepCondition, type CoreStepFunction } from '../types.js'

const coreStep: CoreStepFunction = async function ({
  logs,
  deployId,
  buildDir,
  packagePath,
  constants: { SITE_ID, NETLIFY_API_TOKEN, NETLIFY_API_HOST },
  systemLog,
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

  const blobs = await scanForBlobs(buildDir, packagePath)

  // We checked earlier, but let's be extra safe
  if (blobs === null) {
    systemLog('No blobs to upload to deploy store.')

    return {}
  }

  // If using the deploy config API or the Frameworks API, configure the store
  // to use the region that was configured for the deploy. We don't do it for
  // the legacy file-based upload API since that would be a breaking change.
  if (blobs.apiVersion === 1) {
    storeOpts.region = 'us-east-2'
  }

  const blobStore = getDeployStore(storeOpts)
  const blobsToUpload = blobs.apiVersion >= 3 ? await getBlobs(blobs.directory) : await getKeysToUpload(blobs.directory)

  if (blobsToUpload.length === 0) {
    systemLog('No blobs to upload to deploy store.')

    return {}
  }

  systemLog(`Uploading ${blobsToUpload.length} blobs to deploy store...`)

  try {
    await pMap(
      blobsToUpload,
      async ({ key, contentPath, metadataPath }) => {
        systemLog(`Uploading blob ${key}`)

        const { data, metadata } = await getFileWithMetadata(key, contentPath, metadataPath)
        await blobStore.set(key, new Blob([data]), { metadata })
      },
      { concurrency: 10 },
    )
  } catch (err) {
    logError(logs, `Error uploading blobs to deploy store: ${err.message}`)

    throw new Error(`Failed while uploading blobs to deploy store`)
  }

  systemLog(`Done uploading blobs to deploy store.`)

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
