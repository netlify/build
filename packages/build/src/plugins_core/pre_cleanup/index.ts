import { rm } from 'node:fs/promises'

import { anyBlobsToUpload, getBlobsDir } from '../../utils/blobs.js'

const coreStep = async function ({ buildDir, constants: { PUBLISH_DIR } }) {
  const blobsDir = getBlobsDir({ buildDir, publishDir: PUBLISH_DIR })
  try {
    await rm(blobsDir, { recursive: true, force: true })
  } catch {
    // Ignore errors if it fails, we can continue anyway.
  }

  return {}
}

const blobsPresent = async function ({ buildDir, constants: { PUBLISH_DIR } }): Promise<boolean> {
  return await anyBlobsToUpload({ buildDir, publishDir: PUBLISH_DIR })
}

export const preCleanup = {
  event: 'onPreBuild',
  coreStep,
  coreStepId: 'pre_cleanup',
  coreStepName: 'Pre cleanup',
  coreStepDescription: () => 'Cleaning up leftover files from previous builds',
  condition: blobsPresent,
}
