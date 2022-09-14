import { Buffer } from 'buffer'
import fs from 'fs'
import { createRequire } from 'module'
import { platform } from 'process'
import { PassThrough } from 'stream'

import test from 'ava'
import nock from 'nock'
import { spy } from 'sinon'
import tmp from 'tmp-promise'

import { DenoBridge } from '../node/bridge.js'
import { getPlatformTarget } from '../node/platform.js'

const require = createRequire(import.meta.url)
const archiver = require('archiver')

test('Downloads the Deno CLI on demand and caches it for subsequent calls', async (t) => {
  const latestVersion = '1.20.3'
  const mockBinaryOutput = `#!/usr/bin/env sh\n\necho "deno ${latestVersion}"`
  const data = new PassThrough()
  const archive = archiver('zip', { zlib: { level: 9 } })

  archive.pipe(data)
  archive.append(Buffer.from(mockBinaryOutput), { name: platform === 'win32' ? 'deno.exe' : 'deno' })
  archive.finalize()

  const target = getPlatformTarget()
  const latestReleaseMock = nock('https://dl.deno.land').get('/release-latest.txt').reply(200, `v${latestVersion}`)
  const downloadMock = nock('https://dl.deno.land')
    .get(`/release/v${latestVersion}/deno-${target}.zip`)
    .reply(200, () => data)

  const tmpDir = await tmp.dir()
  const beforeDownload = spy()
  const afterDownload = spy()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir.path,
    onBeforeDownload: beforeDownload,
    onAfterDownload: afterDownload,
    useGlobal: false,
  })
  const output1 = await deno.run(['help'])
  const output2 = await deno.run(['help'])
  const expectedOutput = /^deno [\d.]+/

  t.true(latestReleaseMock.isDone())
  t.true(downloadMock.isDone())
  t.regex(output1?.stdout ?? '', expectedOutput)
  t.regex(output2?.stdout ?? '', expectedOutput)
  t.is(beforeDownload.callCount, 1)
  t.is(afterDownload.callCount, 1)

  await fs.promises.rmdir(tmpDir.path, { recursive: true })
})
