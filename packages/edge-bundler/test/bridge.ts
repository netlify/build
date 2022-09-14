import { Buffer } from 'buffer'
import fs from 'fs'
import { createRequire } from 'module'
import { platform, env } from 'process'
import { PassThrough } from 'stream'

import test from 'ava'
import nock from 'nock'
import { spy } from 'sinon'
import tmp, { DirectoryResult } from 'tmp-promise'

import { DenoBridge } from '../node/bridge.js'
import { getPlatformTarget } from '../node/platform.js'

const require = createRequire(import.meta.url)
const archiver = require('archiver')

const getMockDenoBridge = function (tmpDir: DirectoryResult, mockBinaryOutput: string) {
  const latestVersion = '1.20.3'
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

  const beforeDownload = spy()
  const afterDownload = spy()

  return new DenoBridge({
    cacheDirectory: tmpDir.path,
    onBeforeDownload: beforeDownload,
    onAfterDownload: afterDownload,
    useGlobal: false,
  })
}

test.serial('Does not inherit environment variables if `extendEnv` is false', async (t) => {
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

  t.is(output, 'LULU=LALA')

  await fs.promises.rmdir(tmpDir.path, { recursive: true })
})

test.serial('Does inherit environment variables if `extendEnv` is true', async (t) => {
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

  t.deepEqual(environmentVariables, ['LULU=LALA', 'TADA=TUDU'])

  await fs.promises.rmdir(tmpDir.path, { recursive: true })
})

test.serial('Does inherit environment variables if `extendEnv` is not set', async (t) => {
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

  t.deepEqual(environmentVariables, ['LULU=LALA', 'TADA=TUDU'])

  await fs.promises.rmdir(tmpDir.path, { recursive: true })
})
