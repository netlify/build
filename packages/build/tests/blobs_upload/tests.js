import { access } from 'node:fs/promises'
import { version as nodeVersion } from 'node:process'
import { join } from 'path'

import { BlobsServer, getDeployStore } from '@netlify/blobs'
import { Fixture } from '@netlify/testing'
import test from 'ava'
import getPort from 'get-port'
import semver from 'semver'
import tmp from 'tmp-promise'

const TOKEN = 'test'

test.beforeEach(async (t) => {
  const port = await getPort()
  t.context.blobRequestCount = { set: 0, get: 0 }

  const tmpDir = await tmp.dir()
  t.context.blobServer = new BlobsServer({
    port,
    token: TOKEN,
    directory: tmpDir.path,
    onRequest: ({ type }) => {
      t.context.blobRequestCount[type] = (t.context.blobRequestCount[type] || 0) + 1
    },
  })

  await t.context.blobServer.start()

  process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(
    JSON.stringify({
      edgeURL: `http://localhost:${port}`,
    }),
  ).toString('base64')
})

test.afterEach.always(async (t) => {
  await t.context.blobServer.stop()
  delete process.env.NETLIFY_BLOBS_CONTEXT
})

test.serial("blobs upload, don't run when deploy id is provided and no files in directory", async (t) => {
  const {
    success,
    logs: { stdout },
  } = await new Fixture('./fixtures/src_empty')
    // Passing `offline: true` to avoid fetching the configuration from the API
    .withFlags({ deployId: 'abc123', token: TOKEN, offline: true })
    .runBuildProgrammatic()

  t.true(success)
  t.is(t.context.blobRequestCount.set, 0)

  t.false(stdout.join('\n').includes('Uploading blobs to deploy store'))
})

test.serial("blobs upload, don't run when there are files but deploy id is not provided", async (t) => {
  const fixture = await new Fixture('./fixtures/src_with_blobs').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture.withFlags({ token: TOKEN, offline: true, cwd: fixture.repositoryRoot }).runBuildProgrammatic()

  t.true(success)

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')
  await t.notThrowsAsync(access(blobsDir))

  t.is(t.context.blobRequestCount.set, 0)

  t.false(stdout.join('\n').includes('Uploading blobs to deploy store'))
})

test.serial('blobs upload, uploads files to deploy store', async (t) => {
  const fixture = await new Fixture('./fixtures/src_with_blobs').withCopyRoot({ git: false })

  const {
    success,
    logs: { stdout },
  } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, cwd: fixture.repositoryRoot })
    .runBuildProgrammatic()

  t.true(success)
  t.is(t.context.blobRequestCount.set, 3)

  const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
  if (semver.lt(nodeVersion, '18.0.0')) {
    const nodeFetch = await import('node-fetch')
    storeOpts.fetch = nodeFetch.default
  }

  const store = getDeployStore(storeOpts)

  const blob1 = await store.getWithMetadata('something.txt')
  t.is(blob1.data, 'some value')
  t.deepEqual(blob1.metadata, {})

  const blob2 = await store.getWithMetadata('with-metadata.txt')
  t.is(blob2.data, 'another value')
  t.deepEqual(blob2.metadata, { meta: 'data', number: 1234 })

  const blob3 = await store.getWithMetadata('nested/file.txt')
  t.is(blob3.data, 'file value')
  t.deepEqual(blob3.metadata, { some: 'metadata' })

  t.true(stdout.join('\n').includes('Uploading blobs to deploy store'))
})

test.serial('blobs upload, cancels deploy if blob metadata is malformed', async (t) => {
  const fixture = await new Fixture('./fixtures/src_with_malformed_blobs_metadata').withCopyRoot({ git: false })
  const { success, severityCode } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, debug: false })
    .runBuildProgrammatic()

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')
  await t.notThrowsAsync(access(blobsDir))

  t.is(t.context.blobRequestCount.set, 0)

  t.false(success)
  t.is(severityCode, 4)
})

// the monorepo works with pnpm which is not available on node 14 tests
if (semver.gte(nodeVersion, '16.9.0')) {
  test.serial('monorepo > blobs upload, uploads files to deploy store', async (t) => {
    const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot({ git: false })
    const {
      success,
      logs: { stdout },
    } = await fixture
      .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, packagePath: 'apps/app-1' })
      .runBuildProgrammatic()

    t.true(success)
    t.is(t.context.blobRequestCount.set, 3)

    const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
    if (semver.lt(nodeVersion, '18.0.0')) {
      const nodeFetch = await import('node-fetch')
      storeOpts.fetch = nodeFetch.default
    }

    const store = getDeployStore(storeOpts)

    const blob1 = await store.getWithMetadata('something.txt')
    t.is(blob1.data, 'some value')
    t.deepEqual(blob1.metadata, {})

    const blob2 = await store.getWithMetadata('with-metadata.txt')
    t.is(blob2.data, 'another value')
    t.deepEqual(blob2.metadata, { meta: 'data', number: 1234 })

    const blob3 = await store.getWithMetadata('nested/file.txt')
    t.is(blob3.data, 'file value')
    t.deepEqual(blob3.metadata, { some: 'metadata' })

    t.true(stdout.join('\n').includes('Uploading blobs to deploy store'))
  })
}
