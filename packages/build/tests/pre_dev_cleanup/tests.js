import { access } from 'node:fs/promises'
import { join } from 'path'

import { Fixture } from '@netlify/testing'
import test from 'ava'

test('Build removes blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/with_preexisting_blobs').withCopyRoot({ git: false })

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'deploy', 'v1', 'blobs', 'deploy')

  await t.notThrowsAsync(access(blobsDir))

  const {
    success,
    logs: { stdout },
  } = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
    })
    .runBuildProgrammatic()

  t.true(success)
  t.true(stdout.join('\n').includes('Cleaning up leftover files from previous builds'))

  await t.throwsAsync(access(blobsDir))
})

test('Build removes legacy blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/with_preexisting_legacy_blobs').withCopyRoot({ git: false })

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')

  await t.notThrowsAsync(access(blobsDir))

  const {
    success,
    logs: { stdout },
  } = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
    })
    .runBuildProgrammatic()

  t.true(success)
  t.true(stdout.join('\n').includes('Cleaning up leftover files from previous builds'))

  await t.throwsAsync(access(blobsDir))
})
