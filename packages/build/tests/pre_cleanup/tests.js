import { access } from 'node:fs/promises'
import { join } from 'path'

import { Fixture } from '@netlify/testing'
import test from 'ava'

test('Build removes blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/with_preexisting_blobs').withCopyRoot({ git: false })

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

test('Build does not log if there is nothing to cleanup', async (t) => {
  const fixture = await new Fixture('./fixtures/src_empty').withCopyRoot({ git: false })

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')

  await t.throwsAsync(access(blobsDir))

  const {
    success,
    logs: { stdout },
  } = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
    })
    .runBuildProgrammatic()

  t.true(success)
  t.false(stdout.join('\n').includes('Cleaning up leftover files from previous builds'))
})

test('monorepo > Build removes blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot({ git: false })
  const blobsDir = join(fixture.repositoryRoot, 'apps/app-1/.netlify/blobs/deploy')
  await t.notThrowsAsync(access(blobsDir))

  const {
    success,
    logs: { stdout },
  } = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-1',
    })
    .runBuildProgrammatic()

  t.true(success)
  t.true(stdout.join('\n').includes('Cleaning up leftover files from previous builds'))

  await t.throwsAsync(access(blobsDir))
})

test('monorepo > Build does not log if there is nothing to cleanup', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot({ git: false })

  const blobsDir = join(fixture.repositoryRoot, 'apps/app-2/.netlify/blobs/deploy')

  await t.throwsAsync(access(blobsDir))

  const {
    success,
    logs: { stdout },
  } = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-2',
    })
    .runBuildProgrammatic()

  t.true(success)
  t.false(stdout.join('\n').includes('Cleaning up leftover files from previous builds'))
})
