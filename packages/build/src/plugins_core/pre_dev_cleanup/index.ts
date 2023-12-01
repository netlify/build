import { rm, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { NetlifyPluginOptions } from '../../index.js'
import { log } from '../../log/logger.js'

const dirExists = async function (path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch (error) {
    return false
  }
}

type Input = NetlifyPluginOptions & { buildDir: string; logs: any }

const getDirtyDirs = async function ({
  buildDir,
  constants: { INTERNAL_EDGE_FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC },
}: Input): Promise<string[]> {
  const dirs: string[] = []

  if (INTERNAL_FUNCTIONS_SRC && (await dirExists(resolve(buildDir, INTERNAL_FUNCTIONS_SRC)))) {
    dirs.push(INTERNAL_FUNCTIONS_SRC)
  }

  if (INTERNAL_EDGE_FUNCTIONS_SRC && (await dirExists(resolve(buildDir, INTERNAL_EDGE_FUNCTIONS_SRC)))) {
    dirs.push(INTERNAL_EDGE_FUNCTIONS_SRC)
  }

  return dirs
}

export const preDevCleanup = {
  event: 'onPreDev',
  coreStepId: 'pre_dev_cleanup',
  coreStepName: 'Pre Dev cleanup',
  coreStepDescription: () => 'Cleaning up leftover files from previous builds',
  condition: async (input: Input) => {
    const dirs = await getDirtyDirs(input)
    return dirs.length > 0
  },
  coreStep: async (input: Input) => {
    const dirs = await getDirtyDirs(input)
    for (const dir of dirs) {
      await rm(resolve(input.buildDir, dir), { recursive: true, force: true })
    }
    log(input.logs, `Cleaned up ${dirs.join(', ')}.`)
    return {}
  },
}
