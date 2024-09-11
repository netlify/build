import { Buffer } from 'buffer'
import { rm } from 'fs/promises'
import { createRequire } from 'module'
import { platform, env } from 'process'
import { PassThrough } from 'stream'

import nock from 'nock'
import semver from 'semver'
import tmp, { DirectoryResult } from 'tmp-promise'
import { test, expect } from 'vitest'

import { DenoBridge, DENO_VERSION_RANGE } from './bridge.js'
import { getPlatformTarget } from './platform.js'

const require = createRequire(import.meta.url)
const archiver = require('archiver')

const getMockDenoBridge = function (tmpDir: DirectoryResult, mockBinaryOutput: string) {
  const latestVersion = semver.minVersion(DENO_VERSION_RANGE)?.version ?? ''
  const data = new PassThrough()
  const archive = archiver('zip', { zlib: { level: 9 } })

  archive.pipe(data)
  archive.append(Buffer.from(mockBinaryOutput.replace(/@@@latestVersion@@@/g, latestVersion)), {
    name: platform === 'win32' ? 'deno.exe' : 'deno',
  })
  archive.finalize()

  const target = getPlatformTarget()

  nock('https://dl.deno.land').get('/release-latest.txt').reply(200, `v${latestVersion}`)
  nock('https://dl.deno.land')
    .get(`/release/v${latestVersion}/deno-${target}.zip`)
    .reply(200, () => data)

  return new DenoBridge({
    cacheDirectory: tmpDir.path,
    useGlobal: false,
  })
}

test('Does not inherit environment variables if `extendEnv` is false', async () => {
  const tmpDir = await tmp.dir()
  const deno = getMockDenoBridge(
    tmpDir,
    `#!/usr/bin/env sh

    if [ "$1" = "test"  ]
    then
      env
    else
      echo "deno @@@latestVersion@@@"
    fi`,
  )

  // The environment sets some variables so let us see what they are and remove them from the result
  const referenceOutput = await deno.run(['test'], { env: {}, extendEnv: false })
  env.TADA = 'TUDU'
  const result = await deno.run(['test'], { env: { LULU: 'LALA' }, extendEnv: false })
  let output = result?.stdout ?? ''

  delete env.TADA

  referenceOutput?.stdout.split('\n').forEach((line) => {
    output = output.replace(line.trim(), '')
  })
  output = output.trim().replace(/\n+/g, '\n')

  expect(output).toBe('LULU=LALA')

  await rm(tmpDir.path, { force: true, recursive: true, maxRetries: 10 })
})

test('Does inherit environment variables if `extendEnv` is true', async () => {
  const tmpDir = await tmp.dir()
  const deno = getMockDenoBridge(
    tmpDir,
    `#!/usr/bin/env sh

  if [ "$1" = "test"  ]
  then
    env
  else
    echo "deno @@@latestVersion@@@"
  fi`,
  )

  // The environment sets some variables so let us see what they are and remove them from the result
  const referenceOutput = await deno.run(['test'], { env: {}, extendEnv: true })
  env.TADA = 'TUDU'
  const result = await deno.run(['test'], { env: { LULU: 'LALA' }, extendEnv: true })
  let output = result?.stdout ?? ''

  delete env.TADA

  referenceOutput?.stdout.split('\n').forEach((line) => {
    output = output.replace(line.trim(), '')
  })
  // lets remove holes, split lines and sort lines by name, as different OSes might order them different
  const environmentVariables = output.trim().replace(/\n+/g, '\n').split('\n').sort()

  expect(environmentVariables).toEqual(['LULU=LALA', 'TADA=TUDU'])

  await rm(tmpDir.path, { force: true, recursive: true, maxRetries: 10 })
})

test('Does inherit environment variables if `extendEnv` is not set', async () => {
  const tmpDir = await tmp.dir()
  const deno = getMockDenoBridge(
    tmpDir,
    `#!/usr/bin/env sh

    if [ "$1" = "test"  ]
    then
      env
    else
      echo "deno @@@latestVersion@@@"
    fi`,
  )

  // The environment sets some variables so let us see what they are and remove them from the result
  const referenceOutput = await deno.run(['test'], { env: {}, extendEnv: true })
  env.TADA = 'TUDU'
  const result = await deno.run(['test'], { env: { LULU: 'LALA' } })
  let output = result?.stdout ?? ''

  delete env.TADA

  referenceOutput?.stdout.split('\n').forEach((line) => {
    output = output.replace(line.trim(), '')
  })
  // lets remove holes, split lines and sort lines by name, as different OSes might order them different
  const environmentVariables = output.trim().replace(/\n+/g, '\n').split('\n').sort()

  expect(environmentVariables).toEqual(['LULU=LALA', 'TADA=TUDU'])

  await rm(tmpDir.path, { force: true, recursive: true, maxRetries: 10 })
})
