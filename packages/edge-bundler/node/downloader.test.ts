import { rm } from 'fs/promises'
import { platform } from 'process'
import { PassThrough } from 'stream'

import { execa } from 'execa'
import nock from 'nock'
import tmp from 'tmp-promise'
import { beforeEach, afterEach, test, expect, type TestContext as VitestTestContext, vi } from 'vitest'

import { fixturesDir, testLogger } from '../test/util.js'

import { download } from './downloader.js'
import { getPlatformTarget } from './platform.js'

// This changes the defaults for p-retry
// minTimeout 1000 -> 10
// factor 2 -> 1
// This reduces the wait time in the tests from `2s, 4s, 8s` to `10ms, 10ms, 10ms` for 3 retries
vi.mock('p-retry', async (importOriginal) => {
  const pRetry = (await importOriginal()) as typeof import('p-retry')
  type Params = Parameters<typeof pRetry.default>

  return {
    default: (func: Params[0], options: Params[1]) => pRetry.default(func, { minTimeout: 10, factor: 1, ...options }),
  }
})

const streamError = () => {
  const stream = new PassThrough()
  setTimeout(() => stream.emit('data', 'zipcontent'), 100)
  setTimeout(() => stream.emit('error', new Error('stream error')), 200)

  return stream
}

interface TestContext extends VitestTestContext {
  tmpDir: string
}

beforeEach(async (ctx: TestContext) => {
  const tmpDir = await tmp.dir()

  ctx.tmpDir = tmpDir.path
})

afterEach(async (ctx: TestContext) => {
  await rm(ctx.tmpDir, { force: true, recursive: true, maxRetries: 10 })
})

test('tries downloading binary up to 4 times', async (ctx: TestContext) => {
  nock.disableNetConnect()

  const version = '99.99.99'
  const mockURL = 'https://dl.deno.land:443'
  const target = getPlatformTarget()
  const zipPath = `/release/v${version}/deno-${target}.zip`
  const latestVersionMock = nock(mockURL)
    .get('/release-latest.txt')
    .reply(200, `v${version}\n`)

    // first attempt
    .get(zipPath)
    .reply(500)

    // second attempt
    .get(zipPath)
    .reply(500)

    // third attempt
    .get(zipPath)
    .reply(500)

    // fourth attempt
    .get(zipPath)
    // 1 second delay
    .delayBody(1000)
    .replyWithFile(200, platform === 'win32' ? `${fixturesDir}/deno.win.zip` : `${fixturesDir}/deno.zip`, {
      'Content-Type': 'application/zip',
    })

  const deno = await download(ctx.tmpDir, `^${version}`, testLogger)

  expect(latestVersionMock.isDone()).toBe(true)
  expect(deno).toBeTruthy()

  const res = await execa(deno)
  expect(res.stdout).toBe('hello')
})

test('fails downloading binary after 4th time', async (ctx: TestContext) => {
  expect.assertions(2)

  nock.disableNetConnect()

  const version = '99.99.99'
  const mockURL = 'https://dl.deno.land:443'
  const target = getPlatformTarget()
  const zipPath = `/release/v${version}/deno-${target}.zip`
  const latestVersionMock = nock(mockURL)
    .get('/release-latest.txt')
    .reply(200, `v${version}\n`)

    // first attempt
    .get(zipPath)
    .reply(500)

    // second attempt
    .get(zipPath)
    .reply(500)

    // third attempt
    .get(zipPath)
    .reply(500)

    // fourth attempt
    .get(zipPath)
    .reply(500)

  try {
    await download(ctx.tmpDir, `^${version}`, testLogger)
  } catch (error) {
    expect((error as Error).message).toMatch(/Download failed with status code 500/)
  }

  expect(latestVersionMock.isDone()).toBe(true)
})

test('fails downloading if response stream throws error', async (ctx: TestContext) => {
  expect.assertions(2)

  nock.disableNetConnect()

  const version = '99.99.99'
  const mockURL = 'https://dl.deno.land:443'
  const target = getPlatformTarget()
  const zipPath = `/release/v${version}/deno-${target}.zip`

  const latestVersionMock = nock(mockURL)
    .get('/release-latest.txt')
    .reply(200, `v${version}\n`)

    // first attempt
    .get(zipPath)
    .reply(200, streamError)

    // second attempt
    .get(zipPath)
    .reply(200, streamError)

    // third attempt
    .get(zipPath)
    .reply(200, streamError)

    // fourth attempt
    .get(zipPath)
    .reply(200, streamError)

  try {
    await download(ctx.tmpDir, `^${version}`, testLogger)
  } catch (error) {
    expect((error as Error).message).toMatch(/stream error/)
  }

  expect(latestVersionMock.isDone()).toBe(true)
})
