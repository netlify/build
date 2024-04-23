import { access } from 'node:fs/promises'
import { join, sep } from 'path'

import { Fixture } from '@netlify/testing'
import test from 'ava'

test('Build removes blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/with_preexisting_blobs')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'deploy', 'v1', 'blobs', 'deploy')

  await t.notThrowsAsync(access(blobsDir))

  const output = await fixture.runDev(() => {})

  t.true(output.includes('Cleaning up leftover files from previous builds'))
  t.true(output.includes(`Cleaned up .netlify${sep}deploy${sep}v1${sep}blobs${sep}deploy`))

  await t.throwsAsync(access(blobsDir))
})

test('Build removes legacy blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/with_preexisting_legacy_blobs')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')

  await t.notThrowsAsync(access(blobsDir))

  const output = await fixture.runDev(() => {})

  t.true(output.includes('Cleaning up leftover files from previous builds'))
  t.true(output.includes(`Cleaned up .netlify${sep}blobs${sep}deploy`))

  await t.throwsAsync(access(blobsDir))
})
