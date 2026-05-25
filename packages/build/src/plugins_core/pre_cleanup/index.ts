import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

import { getBlobsDirs } from '../../utils/blobs.js'
import { FRAMEWORKS_API_PATH } from '../../utils/frameworks_api.js'
import { CoreStep, CoreStepFunction } from '../types.js'

const coreStep: CoreStepFunction = async ({ buildDir, constants, packagePath }) => {
  const paths = [
    ...getBlobsDirs(buildDir, packagePath),
    resolve(buildDir, packagePath || '', FRAMEWORKS_API_PATH),
    constants.DB_MIGRATIONS_DIST ? resolve(buildDir, constants.DB_MIGRATIONS_DIST) : undefined,
  ].filter((path): path is string => Boolean(path))

  try {
    await Promise.all(paths.map((dir) => rm(dir, { recursive: true, force: true })))
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
