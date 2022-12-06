import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

import cpy from 'cpy'
import tmp from 'tmp-promise'

import { getLogger } from '../node/logger.js'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const testLogger = getLogger(() => {})

const url = new URL(import.meta.url)
const dirname = fileURLToPath(url)
const fixturesDir = resolve(dirname, '..', 'fixtures')

const useFixture = async (fixtureName: string) => {
  const tmpDir = await tmp.dir()
  const cleanup = () => fs.rmdir(tmpDir.path, { recursive: true })
  const fixtureDir = resolve(fixturesDir, fixtureName)

  await cpy(`${fixtureDir}/**`, tmpDir.path)

  const distPath = join(tmpDir.path, '.netlify', 'edge-functions-dist')

  return {
    basePath: tmpDir.path,
    cleanup,
    distPath,
  }
}

export { fixturesDir, testLogger, useFixture }
