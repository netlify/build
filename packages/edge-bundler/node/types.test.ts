import { readFile, rm, writeFile } from 'fs/promises'
import { join } from 'path'

import nock from 'nock'
import tmp from 'tmp-promise'
import { test, expect, vi } from 'vitest'

import { testLogger } from '../test/util.js'

import { DenoBridge } from './bridge.js'
import { ensureLatestTypes } from './types.js'

test('`ensureLatestTypes` updates the Deno CLI cache if the local version of types is outdated', async () => {
  const mockURL = 'https://edge.netlify'
  const mockVersion = '123456789'
  const latestVersionMock = nock(mockURL).get('/version.txt').reply(200, mockVersion)

  const tmpDir = await tmp.dir()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir.path,
    logger: testLogger,
  })

  // @ts-expect-error return value not used
  const mock = vi.spyOn(deno, 'run').mockResolvedValue({})

  await ensureLatestTypes(deno, testLogger, mockURL)

  const versionFile = await readFile(join(tmpDir.path, 'types-version.txt'), 'utf8')

  expect(latestVersionMock.isDone()).toBe(true)
  expect(mock).toHaveBeenCalledTimes(1)
  expect(mock).toHaveBeenCalledWith(['cache', '--no-lock', '-r', mockURL])
  expect(versionFile).toBe(mockVersion)

  mock.mockRestore()

  await rm(tmpDir.path, { force: true, recursive: true, maxRetries: 10 })
})

test('`ensureLatestTypes` does not update the Deno CLI cache if the local version of types is up-to-date', async () => {
  const mockURL = 'https://edge.netlify'
  const mockVersion = '987654321'

  const tmpDir = await tmp.dir()
  const versionFilePath = join(tmpDir.path, 'types-version.txt')

  await writeFile(versionFilePath, mockVersion)

  const latestVersionMock = nock(mockURL).get('/version.txt').reply(200, mockVersion)
  const deno = new DenoBridge({
    cacheDirectory: tmpDir.path,
    logger: testLogger,
  })

  // @ts-expect-error return value not used
  const mock = vi.spyOn(deno, 'run').mockResolvedValue({})

  await ensureLatestTypes(deno, testLogger, mockURL)

  expect(latestVersionMock.isDone()).toBe(true)
  expect(mock).not.toHaveBeenCalled()

  mock.mockRestore()

  await rm(tmpDir.path, { force: true, recursive: true, maxRetries: 10 })
})

test('`ensureLatestTypes` does not throw if the types URL is not available', async () => {
  const mockURL = 'https://edge.netlify'
  const latestVersionMock = nock(mockURL).get('/version.txt').reply(500)

  const tmpDir = await tmp.dir()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir.path,
    logger: testLogger,
  })

  // @ts-expect-error return value not used
  const mock = vi.spyOn(deno, 'run').mockResolvedValue({})

  await ensureLatestTypes(deno, testLogger, mockURL)

  expect(latestVersionMock.isDone()).toBe(true)
  expect(mock).not.toHaveBeenCalled()

  mock.mockRestore()

  await rm(tmpDir.path, { force: true, recursive: true, maxRetries: 10 })
})
