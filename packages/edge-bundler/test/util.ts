import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

import tmp from 'tmp-promise'

import { getLogger } from '../node/logger.js'

const testLogger = getLogger(() => {
  // no-op
})

const url = new URL(import.meta.url)
const dirname = fileURLToPath(url)
const fixturesDir = resolve(dirname, '..', 'fixtures')

const useFixture = async (fixtureName: string) => {
  const tmpDir = await tmp.dir()
  const cleanup = () => fs.rmdir(tmpDir.path, { recursive: true })
  const fixtureDir = resolve(fixturesDir, fixtureName)
  const distPath = join(tmpDir.path, '.netlify', 'edge-functions-dist')

  return {
    basePath: fixtureDir,
    cleanup,
    distPath,
  }
}

export { fixturesDir, testLogger, useFixture }
