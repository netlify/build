import { mkdir, readdir, readFile } from 'fs/promises'
import { join } from 'path'

import { execa } from 'execa'
import { dir as getTmpDir } from 'tmp-promise'
import { describe, expect, test } from 'vitest'

import { bundle, zipFunctions } from '../src/main.js'
import type { Manifest } from '../src/manifest.js'

import { FIXTURES_DIR } from './helpers/main.js'

const FIXTURE = join(FIXTURES_DIR, 'netlify-server')
const FUNCTIONS_DIR = join(FIXTURE, 'functions')
const SERVER_ENTRY = join(FIXTURE, 'netlify', 'server', 'index.js')

const readManifest = async (path: string): Promise<Manifest> => JSON.parse(await readFile(path, 'utf-8')) as Manifest

const bundleFixture = async (server?: { path: string }) => {
  const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
  const manifestPath = join(tmpDir, 'manifest.json')
  const result = await bundle({
    basePath: FIXTURE,
    destFolder: tmpDir,
    functions: { paths: { user: { directories: [FUNCTIONS_DIR] } } },
    manifest: manifestPath,
    server,
  })

  return { manifest: await readManifest(manifestPath), result, tmpDir }
}

describe('Netlify Server', () => {
  test('Reports the server on its own and never among the functions', async () => {
    const { manifest, result } = await bundleFixture({ path: SERVER_ENTRY })

    expect(manifest.server?.name).toBe('server')
    expect(manifest.functions.map(({ name }) => name)).toEqual(['hello'])
    expect(result.server?.name).toBe('server')
    expect(result.functions.map(({ name }) => name)).toEqual(['hello'])
  })

  test('Bundles the server from the user entry file, with no generated file in between', async () => {
    const { manifest } = await bundleFixture({ path: SERVER_ENTRY })

    expect(manifest.server?.mainFile).toBe(SERVER_ENTRY)
  })

  test('Gives the server a catch-all route that prefers static files', async () => {
    const { manifest } = await bundleFixture({ path: SERVER_ENTRY })

    expect(manifest.server?.routes).toHaveLength(1)
    expect(manifest.server?.routes?.[0]?.pattern).toBe('/*')
    expect(manifest.server?.routes?.[0]?.prefer_static).toBe(true)
  })

  test('Keeps the server archive out of the functions output folder', async () => {
    const { manifest, tmpDir } = await bundleFixture({ path: SERVER_ENTRY })

    expect(manifest.server?.path.startsWith(join(tmpDir, 'server'))).toBe(true)
  })

  test('Bundles the server ready to run on Play, not as a Lambda function', async () => {
    const { result } = await bundleFixture({ path: SERVER_ENTRY })
    const archive = result.server!.path

    expect(archive.endsWith('.tgz')).toBe(true)

    const extractDir = join(archive, '..', 'extracted')

    await mkdir(extractDir, { recursive: true })
    await execa('tar', ['-xzf', archive, '-C', extractDir])

    const contents = (await readdir(extractDir)).sort()

    // Nothing rewrites this bundle after the build, so it carries the marker the
    // guest reads and the entry file the guest imports, and no Lambda bootstrap.
    expect(contents).toContain('___netlify-server.json')
    expect(contents).not.toContain('___netlify-bootstrap.mjs')
    expect(await readFile(join(extractDir, '___netlify-server.json'), 'utf-8')).toBe('{}')
    expect(await readFile(join(extractDir, '___netlify-entry-point.mjs'), 'utf-8')).toMatch(
      /export \* as func from '\.\//,
    )
  })

  test('Omits the properties that only make sense for a function', async () => {
    const { manifest } = await bundleFixture({ path: SERVER_ENTRY })

    expect(manifest.server).not.toHaveProperty('schedule')
    expect(manifest.server).not.toHaveProperty('timeout')
    expect(manifest.server).not.toHaveProperty('priority')
    expect(manifest.server).not.toHaveProperty('invocationMode')
    expect(manifest.server).not.toHaveProperty('generator')
  })

  test('Bundles a deploy that has a server and no functions', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
    const manifestPath = join(tmpDir, 'manifest.json')
    const result = await bundle({
      basePath: FIXTURE,
      destFolder: tmpDir,
      manifest: manifestPath,
      server: { path: SERVER_ENTRY },
    })

    expect(result.functions).toEqual([])
    expect(result.server?.name).toBe('server')
    expect((await readManifest(manifestPath)).functions).toEqual([])
  })

  test('Leaves the manifest untouched when no server is given', async () => {
    const { manifest, result } = await bundleFixture()

    expect(manifest.server).toBeUndefined()
    expect(manifest.functions.map(({ name }) => name)).toEqual(['hello'])
    expect(result.server).toBeUndefined()
  })

  test('Fails the build when the server entry cannot be read', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })

    await expect(
      bundle({
        basePath: FIXTURE,
        destFolder: tmpDir,
        functions: { paths: { user: { directories: [FUNCTIONS_DIR] } } },
        manifest: join(tmpDir, 'manifest.json'),
        server: { path: join(FIXTURE, 'netlify', 'server', 'nope.js') },
      }),
    ).rejects.toThrow('Could not read the Netlify Server')
  })

  test('zipFunctions bundles only functions and still returns an array', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
    const manifestPath = join(tmpDir, 'manifest.json')
    const results = await zipFunctions({ user: { directories: [FUNCTIONS_DIR] } }, tmpDir, {
      basePath: FIXTURE,
      manifest: manifestPath,
    })

    expect(Array.isArray(results)).toBe(true)
    expect(results.map(({ name }) => name)).toEqual(['hello'])
    expect((await readManifest(manifestPath)).server).toBeUndefined()
  })
})
