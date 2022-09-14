import { promises as fs } from 'fs'
import { join } from 'path'

import test from 'ava'
import nock from 'nock'
import { stub } from 'sinon'
import tmp from 'tmp-promise'

import { DenoBridge } from '../node/bridge.js'
import { getLogger } from '../node/logger.js'
import { ensureLatestTypes } from '../node/types.js'

const testLogger = getLogger(() => {
  // no-op
})

test('`ensureLatestTypes` updates the Deno CLI cache if the local version of types is outdated', async (t) => {
  const mockURL = 'https://edge.netlify'
  const mockVersion = '123456789'
  const latestVersionMock = nock(mockURL).get('/version.txt').reply(200, mockVersion)

  const tmpDir = await tmp.dir()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir.path,
    logger: testLogger,
  })

  const mock = stub(deno, 'run').resolves()

  await ensureLatestTypes(deno, testLogger, mockURL)

  const versionFile = await fs.readFile(join(tmpDir.path, 'types-version.txt'), 'utf8')

  t.true(latestVersionMock.isDone())
  t.is(mock.callCount, 1)
  t.deepEqual(mock.firstCall.firstArg, ['cache', '-r', mockURL])
  t.is(versionFile, mockVersion)

  mock.restore()

  await fs.rmdir(tmpDir.path, { recursive: true })
})

test('`ensureLatestTypes` does not update the Deno CLI cache if the local version of types is up-to-date', async (t) => {
  const mockURL = 'https://edge.netlify'
  const mockVersion = '987654321'

  const tmpDir = await tmp.dir()
  const versionFilePath = join(tmpDir.path, 'types-version.txt')

  await fs.writeFile(versionFilePath, mockVersion)

  const latestVersionMock = nock(mockURL).get('/version.txt').reply(200, mockVersion)
  const deno = new DenoBridge({
    cacheDirectory: tmpDir.path,
    logger: testLogger,
  })
  const mock = stub(deno, 'run').resolves()

  await ensureLatestTypes(deno, testLogger, mockURL)

  t.true(latestVersionMock.isDone())
  t.is(mock.callCount, 0)

  mock.restore()

  await fs.rmdir(tmpDir.path, { recursive: true })
})

test('`ensureLatestTypes` does not throw if the types URL is not available', async (t) => {
  const mockURL = 'https://edge.netlify'
  const latestVersionMock = nock(mockURL).get('/version.txt').reply(500)

  const tmpDir = await tmp.dir()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir.path,
    logger: testLogger,
  })

  const mock = stub(deno, 'run').resolves()

  await ensureLatestTypes(deno, testLogger, mockURL)

  t.true(latestVersionMock.isDone())
  t.is(mock.callCount, 0)

  mock.restore()

  await fs.rmdir(tmpDir.path, { recursive: true })
})
