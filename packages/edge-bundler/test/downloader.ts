import { promises as fs } from 'fs'
import { platform } from 'process'
import { PassThrough } from 'stream'

// eslint-disable-next-line ava/use-test
import testFn, { TestFn } from 'ava'
import { execa } from 'execa'
import nock from 'nock'
import tmp from 'tmp-promise'

import { download } from '../src/downloader.js'
import { getLogger } from '../src/logger.js'
import { getPlatformTarget } from '../src/platform.js'

const testLogger = getLogger(() => {
})

const streamError = () => {
  const stream = new PassThrough()
  setTimeout(() => stream.emit('data', 'zipcontent'), 100)
  setTimeout(() => stream.emit('error', new Error('stream error')), 200)

  return stream
}

interface Context {
  tmpDir: string
}
const test = testFn as TestFn<Context>

test.beforeEach(async (t) => {
  const tmpDir = await tmp.dir()
  t.context = { tmpDir: tmpDir.path }
})

test.afterEach(async (t) => {
  await fs.rmdir(t.context.tmpDir, { recursive: true })
})

test.serial('tries downloading binary up to 4 times', async (t) => {
  t.timeout(15_000)
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
    .replyWithFile(200, platform === 'win32' ? './test/fixtures/deno.win.zip' : './test/fixtures/deno.zip', {
      'Content-Type': 'application/zip',
    })

  const deno = await download(t.context.tmpDir, `^${version}`, testLogger)

  t.true(latestVersionMock.isDone())
  t.truthy(deno)

  const res = await execa(deno)
  t.is(res.stdout, 'hello')
})

test.serial('fails downloading binary after 4th time', async (t) => {
  t.timeout(15_000)
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

  await t.throwsAsync(() => download(t.context.tmpDir, `^${version}`, testLogger), {
    message: /Download failed with status code 500/,
  })

  t.true(latestVersionMock.isDone())
})

test.serial('fails downloading if response stream throws error', async (t) => {
  t.timeout(15_000)
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

  await t.throwsAsync(() => download(t.context.tmpDir, `^${version}`, testLogger), {
    message: /stream error/,
  })

  t.true(latestVersionMock.isDone())
})
