import { rm, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { listFrameworks } from '@netlify/framework-info'

import { log } from '../../log/logger.js'
import { DEPLOY_CONFIG_BLOBS_PATH, LEGACY_BLOBS_PATH } from '../../utils/blobs.js'
import { CoreStep, CoreStepCondition, CoreStepFunction, CoreStepFunctionArgs } from '../types.js'

const dirExists = async (path: string): Promise<boolean> => {
  try {
    await stat(path)
    return true
  } catch (error) {
    return false
  }
}

const getDirtyDirs = async function ({
  buildDir,
  constants: { INTERNAL_EDGE_FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC },
  packagePath,
}: CoreStepFunctionArgs): Promise<string[]> {
  const directories: string[] = []

  if (INTERNAL_FUNCTIONS_SRC && (await dirExists(resolve(buildDir, INTERNAL_FUNCTIONS_SRC)))) {
    directories.push(INTERNAL_FUNCTIONS_SRC)
  }

  if (INTERNAL_EDGE_FUNCTIONS_SRC && (await dirExists(resolve(buildDir, INTERNAL_EDGE_FUNCTIONS_SRC)))) {
    directories.push(INTERNAL_EDGE_FUNCTIONS_SRC)
  }

  if (await dirExists(resolve(buildDir, packagePath || '', LEGACY_BLOBS_PATH))) {
    directories.push(join(packagePath || '', LEGACY_BLOBS_PATH))
  }

  if (await dirExists(resolve(buildDir, packagePath || '', DEPLOY_CONFIG_BLOBS_PATH))) {
    directories.push(join(packagePath || '', DEPLOY_CONFIG_BLOBS_PATH))
  }

  return directories
}

const coreStep: CoreStepFunction = async (input) => {
  const dirs = await getDirtyDirs(input)
  for (const dir of dirs) {
    await rm(resolve(input.buildDir, dir), { recursive: true, force: true })
  }
  log(input.logs, `Cleaned up ${dirs.join(', ')}.`)
  return {}
}

const condition: CoreStepCondition = async (input) => {
  // We don't want to clear directories for Remix or Remix-based frameworks,
  // due to the way they run Netlify Dev.
  try {
    const frameworks = await listFrameworks({ projectDir: input.buildDir })

    for (const framework of frameworks) {
      if (framework.id === 'hydrogen' || framework.id === 'remix') {
        return false
      }
    }
  } catch {
    // no-op
  }

  const dirs = await getDirtyDirs(input)
  return dirs.length > 0
}

export const preDevCleanup: CoreStep = {
  event: 'onPreDev',
  coreStep,
  coreStepId: 'pre_dev_cleanup',
  coreStepName: 'Pre Dev cleanup',
  coreStepDescription: () => 'Cleaning up leftover files from previous builds',
  condition,
}
