import { AsyncLocalStorage } from 'node:async_hooks'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { platform } from 'node:process'
import { join } from 'path'

import { getDeployStore } from '@netlify/blobs'
import { BlobsServer } from '@netlify/blobs/server'
import { Fixture } from '@netlify/testing'
import getPort from 'get-port'
import { spyOn } from 'tinyspy'
import tmp from 'tmp-promise'
import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from 'vitest'

const TOKEN = 'test'

type FetchImplementation = (origFetch: typeof fetch, ...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>

let fetchSpy: ReturnType<typeof spyOn>
let blobRequests: Partial<Record<string, string[]>>
let blobServer: BlobsServer

const fetchCustomImplementationStore = new AsyncLocalStorage<{ fetchImplementation: FetchImplementation }>()

beforeAll(() => {
  const origFetch = globalThis.fetch.bind(globalThis)
  fetchSpy = spyOn(globalThis, 'fetch', (...args: Parameters<typeof fetch>) => {
    const customFetchImpl = fetchCustomImplementationStore.getStore()?.fetchImplementation
    if (customFetchImpl) {
      // we pass origFetch as first argument to allow custom implementation to still use it
      return customFetchImpl(origFetch, ...args)
    }

    return origFetch(...args)
  })
})

afterAll(() => {
  fetchSpy.restore()
})

beforeEach(async () => {
  const port = await getPort()
  blobRequests = {}

  const tmpDir = await tmp.dir()
  blobServer = new BlobsServer({
    port,
    token: TOKEN,
    directory: tmpDir.path,
    onRequest: ({ type, url }) => {
      blobRequests[type] = [...(blobRequests[type] ?? []), url]
    },
  })

  await blobServer.start()

  process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(
    JSON.stringify({
      apiURL: `http://localhost:${String(port)}`,
    }),
  ).toString('base64')
})

afterEach(async () => {
  await blobServer.stop()
  delete process.env.NETLIFY_BLOBS_CONTEXT
})

test('Blobs upload step uploads files when deploy ID is provided and no files in directory', async () => {
  const { success, logs } = await new Fixture(import.meta.url, './fixtures/src_empty')
    // Passing `offline: true` to avoid fetching the configuration from the API
    .withFlags({ deployId: 'abc123', token: TOKEN, offline: true })
    .runBuildProgrammatic()

  expect(success).toBe(true)
  expect(blobRequests.set).toBe(undefined)

  expect(logs?.stdout.join('\n')).not.toContain('Uploading blobs to deploy store')
})

test('Blobs upload step uploads files when there are files but deploy ID is not provided (legacy API)', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/src_with_blobs_legacy').withCopyRoot({ git: false })

  const { success, logs } = await fixture
    .withFlags({ token: TOKEN, offline: true, cwd: fixture.repositoryRoot })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'blobs', 'deploy')
  await expect(access(blobsDir)).resolves.toBeUndefined()

  expect(blobRequests.set).toBe(undefined)

  expect(logs?.stdout.join('\n')).not.toContain('Uploading blobs to deploy store')
})

test('Blobs upload step uploads files to deploy store (legacy API)', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/src_with_blobs_legacy').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, cwd: fixture.repositoryRoot })
    .runBuildProgrammatic()

  expect(success).toBe(true)
  expect(blobRequests.set).toHaveLength(6)

  const defaultRegionRequests = blobRequests.set?.filter((urlPath) => {
    const url = new URL(urlPath, 'http://localhost')

    return url.searchParams.get('region') === 'us-east-2'
  })

  expect(defaultRegionRequests).toHaveLength(3)

  const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
  const store = getDeployStore(storeOpts)

  const blob1 = await store.getWithMetadata('something.txt')
  expect(blob1?.data).toBe('some value')
  expect(blob1?.metadata).toEqual({})

  const blob2 = await store.getWithMetadata('with-metadata.txt')
  expect(blob2?.data).toBe('another value')
  expect(blob2?.metadata).toEqual({ meta: 'data', number: 1234 })

  const blob3 = await store.getWithMetadata('nested/file.txt')
  expect(blob3?.data).toBe('file value')
  expect(blob3?.metadata).toEqual({ some: 'metadata' })
})

test('Blobs upload step uploads files to deploy store (legacy deploy config API)', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/src_with_blobs_legacy_deploy_config').withCopyRoot({
    git: false,
  })

  const { success } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, cwd: fixture.repositoryRoot })
    .runBuildProgrammatic()
  expect(success).toBe(true)
  expect(blobRequests.set).toHaveLength(6)

  const regionAutoRequests = blobRequests.set?.filter((urlPath) => {
    const url = new URL(urlPath, 'http://localhost')

    return url.searchParams.get('region') === 'auto'
  })

  expect(regionAutoRequests).toHaveLength(3)

  const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
  const store = getDeployStore(storeOpts)

  const blob1 = await store.getWithMetadata('something.txt')
  expect(blob1?.data).toBe('some value')
  expect(blob1?.metadata).toEqual({})

  const blob2 = await store.getWithMetadata('with-metadata.txt')
  expect(blob2?.data).toBe('another value')
  expect(blob2?.metadata).toEqual({ meta: 'data', number: 1234 })

  const blob3 = await store.getWithMetadata('nested/file.txt')
  expect(blob3?.data).toBe('file value')
  expect(blob3?.metadata).toEqual({ some: 'metadata' })
})

test('Blobs upload step uploads files to deploy store', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/src_with_blobs').withCopyRoot({ git: false })

  const { success } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, cwd: fixture.repositoryRoot })
    .runBuildProgrammatic()

  expect(success).toBe(true)

  // 3 requests for getting pre-signed URLs + 3 requests for hitting them.
  expect(blobRequests.set).toHaveLength(6)

  const regionAutoRequests = blobRequests.set?.filter((urlPath) => {
    const url = new URL(urlPath, 'http://localhost')

    return url.searchParams.get('region') === 'auto'
  })

  expect(regionAutoRequests).toHaveLength(3)

  const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
  const store = getDeployStore(storeOpts)

  const blob1 = await store.getWithMetadata('something.txt')
  expect(blob1?.data).toBe('some value')
  expect(blob1?.metadata).toEqual({})

  const blob2 = await store.getWithMetadata('with-metadata.txt')
  expect(blob2?.data).toBe('another value')
  expect(blob2?.metadata).toEqual({ meta: 'data', number: 1234 })

  const blob3 = await store.getWithMetadata('nested/blob')
  expect(blob3?.data).toBe('file value')
  expect(blob3?.metadata).toEqual({ some: 'metadata' })
})

test('Blobs upload step uploads files to dev deploy store', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/src_with_blobs').withCopyRoot({ git: false })

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'v1', 'blobs', 'deploy')
  await mkdir(join(blobsDir, 'something.txt'), { recursive: true })
  await mkdir(join(blobsDir, 'with-metadata.txt'), { recursive: true })
  await mkdir(join(blobsDir, 'nested', 'blob'), { recursive: true })
  await Promise.all([
    writeFile(join(blobsDir, 'something.txt', 'blob'), 'some value'),
    writeFile(join(blobsDir, 'with-metadata.txt', 'blob'), 'another value'),
    writeFile(join(blobsDir, 'with-metadata.txt', 'blob.meta.json'), JSON.stringify({ meta: 'data', number: 1234 })),
    writeFile(join(blobsDir, 'nested', 'blob', 'blob'), 'file value'),
    writeFile(join(blobsDir, 'nested', 'blob', 'blob.meta.json'), JSON.stringify({ some: 'metadata' })),
  ])

  const output = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, cwd: fixture.repositoryRoot })
    .runDev(() => Promise.resolve())

  expect(output.includes('Uploading 3 blobs to deploy store')).toBe(true)

  // 3 requests for getting pre-signed URLs + 3 requests for hitting them.
  expect(blobRequests.set).toHaveLength(6)

  const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
  const store = getDeployStore(storeOpts)

  const blob1 = await store.getWithMetadata('something.txt')
  expect(blob1?.data).toBe('some value')
  expect(blob1?.metadata).toEqual({})

  const blob2 = await store.getWithMetadata('with-metadata.txt')
  expect(blob2?.data).toBe('another value')
  expect(blob2?.metadata).toEqual({ meta: 'data', number: 1234 })

  const blob3 = await store.getWithMetadata('nested/blob')
  expect(blob3?.data).toBe('file value')
  expect(blob3?.metadata).toEqual({ some: 'metadata' })
})

test('Blobs upload step cancels deploy if blob metadata is malformed', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/src_with_malformed_blobs_metadata').withCopyRoot({
    git: false,
  })
  const { success, severityCode } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, debug: false })
    .runBuildProgrammatic()

  const blobsDir = join(fixture.repositoryRoot, '.netlify', 'v1', 'blobs', 'deploy')
  await expect(access(blobsDir)).resolves.toBeUndefined()

  expect(blobRequests.set).toBe(undefined)

  expect(success).toBe(false)
  expect(severityCode).toBe(4)
})

test('monorepo > blobs upload, uploads files to deploy store', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/monorepo').withCopyRoot({ git: false })
  const { success } = await fixture
    .withFlags({ deployId: 'abc123', siteId: 'test', token: TOKEN, offline: true, packagePath: 'apps/app-1' })
    .runBuildProgrammatic()

  expect(success).toBe(true)
  expect(blobRequests.set).toHaveLength(6)

  const storeOpts = { deployID: 'abc123', siteID: 'test', token: TOKEN }
  const store = getDeployStore(storeOpts)

  const blob1 = await store.getWithMetadata('something.txt')
  expect(blob1?.data).toBe('some value')
  expect(blob1?.metadata).toEqual({})

  const blob2 = await store.getWithMetadata('with-metadata.txt')
  expect(blob2?.data).toBe('another value')
  expect(blob2?.metadata).toEqual({ meta: 'data', number: 1234 })

  const blob3 = await store.getWithMetadata('nested/file.txt')
  expect(blob3?.data).toBe('file value')
  expect(blob3?.metadata).toEqual({ some: 'metadata' })
})

test('Blobs upload failure print full error stack and cause to systemlog', async () => {
  const fixture = await new Fixture(import.meta.url, './fixtures/src_with_blobs').withCopyRoot({ git: false })

  const systemLogFile = await tmp.file()

  const { success, logs } = await fetchCustomImplementationStore.run(
    {
      fetchImplementation: (origFetch, ...args) => {
        if (
          typeof args[0] === 'string' &&
          args[0].includes('api/v1/blobs') &&
          typeof args[1] === 'object' &&
          args[1].method === 'put'
        ) {
          throw new Error('Simulated upload error with cause', {
            cause: new Error('Outer internal error', { cause: new Error('Nested internal error') }),
          })
        }
        return origFetch(...args)
      },
    },
    () =>
      fixture
        .withFlags({
          deployId: 'abc123',
          siteId: 'test',
          token: TOKEN,
          offline: true,
          cwd: fixture.repositoryRoot,
          debug: false,
          systemLogFile: systemLogFile.fd,
        })
        .runBuildProgrammatic(),
  )

  expect(success).toBe(false)

  // No file descriptors on Windows, so system logging doesn't work.
  if (platform !== 'win32') {
    const systemLog = await readFile(systemLogFile.path, { encoding: 'utf8' })
    // nested internal error visible in system log
    expect(systemLog.includes('Nested internal error')).toBe(true)
  }

  // internals don't leak to regular output
  expect(logs?.stdout.join('\n')).not.toContain('Nested internal error')
  expect(logs?.stderr.join('\n')).not.toContain('Nested internal error')
})
