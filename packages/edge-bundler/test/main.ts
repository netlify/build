import fs from 'fs'

import test from 'ava'
import { spy } from 'sinon'
import tmp from 'tmp-promise'

import { DenoBridge } from '../src/bridge.js'

test('Downloads the Deno CLI on demand and caches it for subsequent calls', async (t) => {
  // TODO: Mock HTTP call to Deno source, so that we don't need to download
  // the actual package as part of the test.
  // eslint-disable-next-line no-magic-numbers
  t.timeout(20_000)

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

  t.regex(output1?.stdout ?? '', expectedOutput)
  t.regex(output2?.stdout ?? '', expectedOutput)
  t.is(beforeDownload.callCount, 1)
  t.is(afterDownload.callCount, 1)

  await fs.promises.rmdir(tmpDir.path, { recursive: true })
})
