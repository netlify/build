import { version as nodeVersion } from 'node:process'

import { BlobsServer, getDeployStore } from '@netlify/blobs'
import { Fixture, normalizeOutput } from '@netlify/testing'
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

test("blobs upload, don't run when deploy id is provided and no files in directory", async (t) => {
  const output = await new Fixture('./fixtures/src_empty')
    // Passing `offline: true` to avoid fetching the configuration from the API
    .withFlags({ deployId: 'abc123', token: TOKEN, offline: true })
    .runWithBuild()

  t.is(t.context.blobRequestCount.set, 0)

  t.snapshot(normalizeOutput(output))
})

test("blobs upload, don't run when there are files but deploy id is not provided", async (t) => {
  const output = await new Fixture('./fixtures/src_with_blobs')
    .withFlags({ token: TOKEN, offline: true })
    .runWithBuild()

  t.is(t.context.blobRequestCount.set, 0)

  t.snapshot(normalizeOutput(output))
})

test.serial('blobs upload, uploads files to deploy store', async (t) => {
  const output = await new Fixture('./fixtures/src_with_blobs')
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true })
    .runWithBuild()

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

  t.snapshot(normalizeOutput(output))
})

test('blobs upload, cancels deploy if blob metadata is malformed', async (t) => {
  const { success, severityCode } = await new Fixture('./fixtures/src_with_malformed_blobs_metadata')
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, debug: false })
    .runBuildProgrammatic()

  t.is(t.context.blobRequestCount.set, 0)

  t.false(success)
  t.is(severityCode, 4)
})
