import { rm } from 'node:fs/promises'

import { scanForBlobs, getBlobsDirs } from '../../utils/blobs.js'
import { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'

const coreStep: CoreStepFunction = async ({ buildDir, packagePath }) => {
  const blobsDirs = getBlobsDirs(buildDir, packagePath)
  try {
    await Promise.all(blobsDirs.map((dir) => rm(dir, { recursive: true, force: true })))
  } catch {
    // Ignore errors if it fails, we can continue anyway.
  }

  return {}
}

const blobsPresent: CoreStepCondition = async ({ buildDir, packagePath }) =>
  Boolean(await scanForBlobs(buildDir, packagePath))

export const preCleanup: CoreStep = {
  event: 'onPreBuild',
  coreStep,
  coreStepId: 'pre_cleanup',
  coreStepName: 'Pre cleanup',
  coreStepDescription: () => 'Cleaning up leftover files from previous builds',
  condition: blobsPresent,
}
