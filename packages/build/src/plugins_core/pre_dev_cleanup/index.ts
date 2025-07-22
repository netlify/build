import { rm, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

import { CoreStep, CoreStepCondition, CoreStepFunction, CoreStepFunctionArgs } from '../types.js'

const dirExists = async (path: string): Promise<boolean> => {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

const getDirtyDirs = async function ({
  buildDir,
  constants: { INTERNAL_EDGE_FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC },
}: CoreStepFunctionArgs): Promise<string[]> {
  const dirs: string[] = []

  if (INTERNAL_FUNCTIONS_SRC && (await dirExists(resolve(buildDir, INTERNAL_FUNCTIONS_SRC)))) {
    dirs.push(INTERNAL_FUNCTIONS_SRC)
  }

  if (INTERNAL_EDGE_FUNCTIONS_SRC && (await dirExists(resolve(buildDir, INTERNAL_EDGE_FUNCTIONS_SRC)))) {
    dirs.push(INTERNAL_EDGE_FUNCTIONS_SRC)
  }

  return dirs
}

const coreStep: CoreStepFunction = async (input) => {
  const dirs = await getDirtyDirs(input)
  for (const dir of dirs) {
    await rm(resolve(input.buildDir, dir), { recursive: true, force: true })
  }
  input.systemLog(input.logs, `Cleaned up ${dirs.join(', ')}.`)
  return {}
}

const condition: CoreStepCondition = async (input) => {
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
  quiet: true,
}
