import { access } from 'node:fs/promises'
import { version as nodeVersion } from 'node:process'
import { join } from 'path'

import { getDeployStore } from '@netlify/blobs'
import { BlobsServer } from '@netlify/blobs/server'
import { Fixture } from '@netlify/testing'
import test from 'ava'
import getPort from 'get-port'
import semver from 'semver'
import tmp from 'tmp-promise'

const TOKEN = 'test'

test.beforeEach(async (t) => {
  const port = await getPort()
  t.context.blobRequests = {}

  const tmpDir = await tmp.dir()
  t.context.blobServer = new BlobsServer({
    port,
    token: TOKEN,
    directory: tmpDir.path,
    onRequest: ({ type, url }) => {
      t.context.blobRequests[type] = t.context.blobRequests[type] || []
      t.context.blobRequests[type].push(url)
    },
  })

  await t.context.blobServer.start()

  process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(
    JSON.stringify({
      apiURL: `http://localhost:${port}`,
    }),
  ).toString('base64')
})

test.afterEach.always(async (t) => {
  await t.context.blobServer.stop()
  delete process.env.NETLIFY_BLOBS_CONTEXT
})

test.serial('Blobs upload step uploads files when deploy ID is provided and no files in directory', async (t) => {
  const {
    success,
    logs: { stdout },
  } = await new Fixture('./fixtures/src_empty')
    // Passing `offline: true` to avoid fetching the configuration from the API
    .withFlags({ deployId: 'abc123', token: TOKEN, offline: true })
    .runBuildProgrammatic()

  t.true(success)
  t.is(t.context.blobRequests.set, undefined)

  t.false(stdout.join('\n').includes('Uploading blobs to deploy store'))
})

test.serial(
  'Blobs upload step uploads files when there are files but deploy ID is not provided (legacy API)',
  async (t) => {
    const fixture = await new Fixture('./fixtures/src_with_blobs_legacy').withCopyRoot({ git: false })

    const {
      success,
      logs: { stdout },
    } = await fixture.withFlags({ token: TOKEN, offline: true, cwd: fixture.repositoryRoot }).runBuildProgrammatic()

    t.true(success)

    const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')
    await t.notThrowsAsync(access(blobsDir))

    t.is(t.context.blobRequests.set, undefined)

    t.false(stdout.join('\n').includes('Uploading blobs to deploy store'))
  },
)

test.serial('Blobs upload step uploads files to deploy store (legacy API)', async (t) => {
  const fixture = await new Fixture('./fixtures/src_with_blobs_legacy').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, cwd: fixture.repositoryRoot })
    .runBuildProgrammatic()

  t.true(success)
  t.is(t.context.blobRequests.set.length, 6)

  const defaultRegionRequests = t.context.blobRequests.set.filter((urlPath) => {
    const url = new URL(urlPath, 'http://localhost')

    return url.searchParams.get('region') === 'us-east-2'
  })

  t.is(defaultRegionRequests.length, 3)

  const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
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
})

test.serial('Blobs upload step uploads files to deploy store (legacy deploy config API)', async (t) => {
  const fixture = await new Fixture('./fixtures/src_with_blobs_legacy_deploy_config').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, cwd: fixture.repositoryRoot })
    .runBuildProgrammatic()
  t.true(success)
  t.is(t.context.blobRequests.set.length, 6)

  const regionAutoRequests = t.context.blobRequests.set.filter((urlPath) => {
    const url = new URL(urlPath, 'http://localhost')

    return url.searchParams.get('region') === 'auto'
  })

  t.is(regionAutoRequests.length, 3)

  const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
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
})

test.serial('Blobs upload step uploads files to deploy store', async (t) => {
  const fixture = await new Fixture('./fixtures/src_with_blobs').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, cwd: fixture.repositoryRoot })
    .runBuildProgrammatic()

  t.true(success)

  // 3 requests for getting pre-signed URLs + 3 requests for hitting them.
  t.is(t.context.blobRequests.set.length, 6)

  const regionAutoRequests = t.context.blobRequests.set.filter((urlPath) => {
    const url = new URL(urlPath, 'http://localhost')

    return url.searchParams.get('region') === 'auto'
  })

  t.is(regionAutoRequests.length, 3)

  const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
  const store = getDeployStore(storeOpts)

  const blob1 = await store.getWithMetadata('something.txt')
  t.is(blob1.data, 'some value')
  t.deepEqual(blob1.metadata, {})

  const blob2 = await store.getWithMetadata('with-metadata.txt')
  t.is(blob2.data, 'another value')
  t.deepEqual(blob2.metadata, { meta: 'data', number: 1234 })

  const blob3 = await store.getWithMetadata('nested/blob')
  t.is(blob3.data, 'file value')
  t.deepEqual(blob3.metadata, { some: 'metadata' })
})

test.serial('Blobs upload step cancels deploy if blob metadata is malformed', async (t) => {
  const fixture = await new Fixture('./fixtures/src_with_malformed_blobs_metadata').withCopyRoot({ git: false })
  const { success, severityCode } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, debug: false })
    .runBuildProgrammatic()

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'v1', 'blobs', 'deploy')
  await t.notThrowsAsync(access(blobsDir))

  t.is(t.context.blobRequests.set, undefined)

  t.false(success)
  t.is(severityCode, 4)
})

// the monorepo works with pnpm which is not always available
if (semver.gte(nodeVersion, '18.19.0')) {
  test.serial('monorepo > blobs upload, uploads files to deploy store', async (t) => {
    const fixture = await new Fixture('./fixtures/monorepo').withCopyRoot({ git: false })
    const { success } = await fixture
      .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, packagePath: 'apps/app-1' })
      .runBuildProgrammatic()

    t.true(success)
    t.is(t.context.blobRequests.set.length, 6)

    const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
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
  })
}
