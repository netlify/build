import { access } from 'node:fs/promises'
import { join } from 'path'

import { Fixture } from '@netlify/testing'
import test from 'ava'

test('Build removes blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/with_preexisting_blobs')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'deploy', 'v1', 'blobs', 'deploy')

  await t.notThrowsAsync(access(blobsDir))

  await fixture.runDev(() => {})

  await t.throwsAsync(access(blobsDir))
})

test('Build removes legacy blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/with_preexisting_legacy_blobs')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')

  await t.notThrowsAsync(access(blobsDir))

  await fixture.runDev(() => {})

  await t.throwsAsync(access(blobsDir))
})
