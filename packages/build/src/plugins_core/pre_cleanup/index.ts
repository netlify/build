import { rm } from 'node:fs/promises'

import { anyBlobsToUpload, getBlobsDir } from '../../utils/blobs.js'
import { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'

const coreStep: CoreStepFunction = async ({ buildDir, packagePath }) => {
  const blobsDir = getBlobsDir(buildDir, packagePath)
  try {
    await rm(blobsDir, { recursive: true, force: true })
  } catch {
    // Ignore errors if it fails, we can continue anyway.
  }

  return {}
}

const blobsPresent: CoreStepCondition = ({ buildDir, packagePath }) => anyBlobsToUpload(buildDir, packagePath)

export const preCleanup: CoreStep = {
  event: 'onPreBuild',
  coreStep,
  coreStepId: 'pre_cleanup',
  coreStepName: 'Pre cleanup',
  coreStepDescription: () => 'Cleaning up leftover files from previous builds',
  condition: blobsPresent,
}
