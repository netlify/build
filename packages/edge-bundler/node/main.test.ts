import { Buffer } from 'buffer'
import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { platform } from 'process'
import { PassThrough } from 'stream'

import { ZipArchive } from 'archiver'
import nock from 'nock'
import semver from 'semver'
import { test, expect, vi } from 'vitest'

import { DenoBridge, DENO_VERSION_RANGE } from './bridge.js'
import { getPlatformTarget } from './platform.js'

test('Downloads the Deno CLI on demand and caches it for subsequent calls', async () => {
  const latestVersion = semver.minVersion(DENO_VERSION_RANGE)?.version ?? ''
  const mockBinaryOutput = `#!/usr/bin/env sh\n\necho "deno ${latestVersion}"`
  const data = new PassThrough()
  const archive = new ZipArchive({ zlib: { level: 9 } })

  archive.pipe(data)
  archive.append(Buffer.from(mockBinaryOutput), { name: platform === 'win32' ? 'deno.exe' : 'deno' })
  await archive.finalize()

  const target = getPlatformTarget()
  const latestReleaseMock = nock('https://dl.deno.land').get('/release-latest.txt').reply(200, `v${latestVersion}`)
  const downloadMock = nock('https://dl.deno.land')
    .get(`/release/v${latestVersion}/deno-${target}.zip`)
    .reply(200, () => data)

  const tmpDir = await mkdtemp(join(tmpdir(), 'edge-bundler-main-'))
  const beforeDownload = vi.fn()
  const afterDownload = vi.fn()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir,
    onBeforeDownload: beforeDownload,
    onAfterDownload: afterDownload,
    useGlobal: false,
  })
  const output1 = await deno.run(['help'])
  const output2 = await deno.run(['help'])
  const expectedOutput = /^deno [\d.]+/

  expect(latestReleaseMock.isDone()).toBe(true)
  expect(downloadMock.isDone()).toBe(true)
  expect(output1?.stdout ?? '').toMatch(expectedOutput)
  expect(output2?.stdout ?? '').toMatch(expectedOutput)
  expect(beforeDownload).toHaveBeenCalledTimes(1)
  expect(afterDownload).toHaveBeenCalledTimes(1)

  await rm(tmpDir, { force: true, recursive: true, maxRetries: 10 })
})
