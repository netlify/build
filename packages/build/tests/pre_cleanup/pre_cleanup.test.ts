import { access } from 'node:fs/promises'
import { join } from 'path'

import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

test('Build removes blobs directory before starting', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/with_preexisting_blobs').withCopyRoot({ git: false })

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')

  await expect(access(blobsDir)).resolves.toBeUndefined()

  const { success } = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
    })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  await expect(access(blobsDir)).rejects.toThrow()
})

test('Build does not log if there is nothing to cleanup', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/src_empty').withCopyRoot({ git: false })

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')

  await expect(access(blobsDir)).rejects.toThrow()

  const { success, logs } = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
    })
    .runBuildProgrammatic()

  expect(success).toBe(true)
  expect(logs?.stdout.join('\n')).not.toContain('Cleaning up leftover files from previous builds')
})

test('monorepo > Build removes blobs directory before starting', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo').withCopyRoot({ git: false })
  const blobsDir = join(fixture.repositoryRoot, 'apps/app-1/.netlify/blobs/deploy')
  await expect(access(blobsDir)).resolves.toBeUndefined()

  const { success } = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-1',
    })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  await expect(access(blobsDir)).rejects.toThrow()
})

test('monorepo > Build does not log if there is nothing to cleanup', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo').withCopyRoot({ git: false })

  const blobsDir = join(fixture.repositoryRoot, 'apps/app-2/.netlify/blobs/deploy')

  await expect(access(blobsDir)).rejects.toThrow()

  const { success, logs } = await fixture
    .withFlags({
      cwd: fixture.repositoryRoot,
      packagePath: 'apps/app-2',
    })
    .runBuildProgrammatic()

  expect(success).toBe(true)
  expect(logs?.stdout.join('\n')).not.toContain('Cleaning up leftover files from previous builds')
})
