import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

import { getBlobsDirs } from '../../utils/blobs.js'
import { FRAMEWORKS_API_ENDPOINT } from '../../utils/frameworks_api.js'
import { CoreStep, CoreStepFunction } from '../types.js'

const coreStep: CoreStepFunction = async ({ buildDir, packagePath }) => {
  const dirs = [...getBlobsDirs(buildDir, packagePath), resolve(buildDir, packagePath || '', FRAMEWORKS_API_ENDPOINT)]

  try {
    await Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true })))
  } catch {
    // Ignore errors if it fails, we can continue anyway.
  }

  return {}
}

export const preCleanup: CoreStep = {
  event: 'onPreBuild',
  coreStep,
  coreStepId: 'pre_cleanup',
  coreStepName: 'Pre cleanup',
  coreStepDescription: () => 'Cleaning up leftover files from previous builds',
  quiet: true,
}
