import fs from 'fs'

import test from 'ava'
import { spy } from 'sinon'
import tmp from 'tmp-promise'

import { DenoBridge } from '../src/deno.js'

test('Downloads the Deno CLI on demand and caches it for subsequent calls', async (t) => {
  const tmpDir = await tmp.dir()
  const beforeDownload = spy()
  const afterDownload = spy()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir.path,
    onBeforeDownload: beforeDownload,
    onAfterDownload: afterDownload,
    useGlobal: false,
  })
  const { stdout: output1 } = await deno.run(['help'])
  const { stdout: output2 } = await deno.run(['help'])

  t.true(output1.includes('A modern JavaScript and TypeScript runtime'))
  t.true(output2.includes('A modern JavaScript and TypeScript runtime'))
  t.is(beforeDownload.callCount, 1)
  t.is(afterDownload.callCount, 1)

  await fs.promises.rmdir(tmpDir.path, { recursive: true })
})
