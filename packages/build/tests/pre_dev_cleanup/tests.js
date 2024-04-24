import { access } from 'node:fs/promises'
import { join } from 'path'

import { Fixture } from '@netlify/testing'
import test from 'ava'

test('pre-dev removes blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/with-blobs').withFlags({ debug: false, timeline: 'dev' }).withCopyRoot()

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'deploy', 'v1', 'blobs', 'deploy')

  await t.notThrowsAsync(access(blobsDir))

  await fixture.runDev(() => {})

  await t.throwsAsync(access(blobsDir))
})

test('pre-dev removes legacy blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/with-legacy-blobs')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')

  await t.notThrowsAsync(access(blobsDir))

  await fixture.runDev(() => {})

  await t.throwsAsync(access(blobsDir))
})

test('pre-dev removes function directories before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/with-leftover-functions')
    .withFlags({ debug: false, timeline: 'dev' })
    .withCopyRoot()

  const functions_internal_directory = join(fixture.repositoryRoot, '.netlify', 'edge-functions')
  const edge_functions_directory = join(fixture.repositoryRoot, '.netlify', 'functions-internal')

  await t.notThrowsAsync(access(functions_internal_directory))
  await t.notThrowsAsync(access(edge_functions_directory))

  await fixture.runDev(() => {})

  await t.throwsAsync(access(functions_internal_directory))
  await t.throwsAsync(access(edge_functions_directory))
})

test('monorepo > removes blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo')
    .withFlags({ debug: false, timeline: 'dev', packagePath: 'apps/with-blobs' })
    .withCopyRoot({ git: false })

  const blobsDir = join(
    fixture.repositoryRoot,
    fixture.additionalFlags.packagePath,
    '.netlify',
    'deploy',
    'v1',
    'blobs',
    'deploy',
  )

  await t.notThrowsAsync(access(blobsDir))

  await fixture.runDev(() => {})

  await t.throwsAsync(access(blobsDir))
})

test('monorepo > removes legacy blobs directory before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo')
    .withFlags({ debug: false, timeline: 'dev', packagePath: 'apps/with-legacy-blobs' })
    .withCopyRoot({ git: false })

  const blobsDir = join(fixture.repositoryRoot, fixture.additionalFlags.packagePath, '.netlify', 'blobs', 'deploy')

  await t.notThrowsAsync(access(blobsDir))

  await fixture.runDev(() => {})

  await t.throwsAsync(access(blobsDir))
})

test('monorepo > removes function directories before starting', async (t) => {
  const fixture = await new Fixture('./fixtures/monorepo')
    .withFlags({ debug: false, timeline: 'dev', packagePath: 'apps/with-leftover-functions' })
    .withCopyRoot({ git: false })

  const functions_internal_directory = join(
    fixture.repositoryRoot,
    fixture.additionalFlags.packagePath,
    '.netlify',
    'edge-functions',
  )
  const edge_functions_directory = join(
    fixture.repositoryRoot,
    fixture.additionalFlags.packagePath,
    '.netlify',
    'functions-internal',
  )

  await t.notThrowsAsync(access(functions_internal_directory))
  await t.notThrowsAsync(access(edge_functions_directory))

  await fixture.runDev(() => {})

  await t.throwsAsync(access(functions_internal_directory))
  await t.throwsAsync(access(edge_functions_directory))
})
