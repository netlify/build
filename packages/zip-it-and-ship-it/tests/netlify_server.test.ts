import { mkdir, readdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'

import { execa } from 'execa'
import { dir as getTmpDir } from 'tmp-promise'
import { describe, expect, test } from 'vitest'

import { findServerEntry, getServerRoutes, zipFunctions, zipServer } from '../src/main.js'
import type { FunctionBundlingUserError } from '../src/utils/error.js'
import type { Manifest, ServerManifest } from '../src/manifest.js'

import { FIXTURES_DIR } from './helpers/main.js'

const FIXTURE = join(FIXTURES_DIR, 'netlify-server')
const FUNCTIONS_DIR = join(FIXTURE, 'functions')
const SERVER_ENTRY = join(FIXTURE, 'netlify', 'server', 'index.js')
const SERVER_ARCHIVE = 'server.tgz'

const readManifest = async (path: string): Promise<Manifest> => JSON.parse(await readFile(path, 'utf-8')) as Manifest

// The two halves are built the way the two build steps build them: one call
// each, into a destination of its own.
const bundleFixture = async (server?: { path: string }) => {
  const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
  const functionsDest = join(tmpDir, 'functions')
  const serverDest = join(tmpDir, 'server')

  const functionsResult = await zipFunctions({ user: { directories: [FUNCTIONS_DIR] } }, functionsDest, {
    basePath: FIXTURE,
  })
  const serverResult =
    server === undefined ? undefined : await zipServer(server.path, serverDest, { basePath: FIXTURE })

  return {
    functionsManifest: await readManifest(join(functionsDest, 'manifest.json')),
    functionsResult,
    serverDest,
    serverManifest:
      server === undefined ? undefined : ((await readManifest(join(serverDest, 'manifest.json'))) as ServerManifest),
    serverResult,
    tmpDir,
  }
}

describe('Netlify Server', () => {
  test('Reports the server on its own and never among the functions', async () => {
    const { functionsManifest, functionsResult, serverManifest, serverResult } = await bundleFixture({
      path: SERVER_ENTRY,
    })

    expect(serverManifest?.server.path.endsWith(SERVER_ARCHIVE)).toBe(true)
    expect(functionsManifest.functions.map(({ name }) => name)).toEqual(['hello'])
    expect(serverResult?.path.endsWith(SERVER_ARCHIVE)).toBe(true)
    expect(functionsResult.map(({ name }) => name)).toEqual(['hello'])
    expect(functionsManifest.server).toBeUndefined()
  })

  test('Bundles the server from the user entry file, with no generated file in between', async () => {
    const { serverManifest } = await bundleFixture({ path: SERVER_ENTRY })

    expect(serverManifest?.server.mainFile).toBe(SERVER_ENTRY)
  })

  test('Gives the server a catch-all route that prefers static files', async () => {
    const { serverManifest } = await bundleFixture({ path: SERVER_ENTRY })

    expect(serverManifest?.server.routes).toHaveLength(1)
    expect(serverManifest?.server.routes?.[0]?.pattern).toBe('/*')
    expect(serverManifest?.server.routes?.[0]?.prefer_static).toBe(true)
  })

  test('Writes the server and the functions into the destinations they are given', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
    const functionsDest = join(tmpDir, 'functions')
    const serverDest = join(tmpDir, 'server')

    const functionsResult = await zipFunctions({ user: { directories: [FUNCTIONS_DIR] } }, functionsDest, {
      basePath: FIXTURE,
    })
    const serverResult = await zipServer(SERVER_ENTRY, serverDest, { basePath: FIXTURE })

    expect(serverResult.path).toBe(join(serverDest, SERVER_ARCHIVE))
    expect(functionsResult.every(({ path }) => path.startsWith(functionsDest))).toBe(true)
  })

  test('Describes each destination in its own manifest', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
    const functionsDest = join(tmpDir, 'functions')
    const serverDest = join(tmpDir, 'server')

    await zipFunctions({ user: { directories: [FUNCTIONS_DIR] } }, functionsDest, { basePath: FIXTURE })
    await zipServer(SERVER_ENTRY, serverDest, { basePath: FIXTURE })

    // Neither call can drop what the other wrote, which is what lets them be
    // separate build steps.
    const functionsManifest = await readManifest(join(functionsDest, 'manifest.json'))
    const serverManifest = await readManifest(join(serverDest, 'manifest.json'))

    expect(functionsManifest.functions.map(({ name }) => name)).toEqual(['hello'])
    expect((functionsManifest as ServerManifest).server).toBeUndefined()

    // No `functions: []` here: an empty list would read as "this deploy has no
    // functions" rather than "this manifest does not describe them".
    expect(serverManifest.functions).toBeUndefined()
    expect((serverManifest as ServerManifest).server.path).toBe(join(serverDest, SERVER_ARCHIVE))
  })

  test('Bundles the server ready to run on Play, not as a Lambda function', async () => {
    const { serverResult } = await bundleFixture({ path: SERVER_ENTRY })
    const archive = serverResult!.path

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

  test('Builds for Play even when the functions are not archived', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })

    await zipFunctions({ user: { directories: [FUNCTIONS_DIR] } }, join(tmpDir, 'functions'), {
      archiveFormat: 'none',
      basePath: FIXTURE,
    })

    const result = await zipServer(SERVER_ENTRY, join(tmpDir, 'server'), { basePath: FIXTURE })

    expect(result.path.endsWith('.tgz')).toBe(true)
  })

  test('Takes no function configuration at all', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })

    // The server is built by a call of its own, which has nowhere to put
    // function configuration: no `[functions.server]` block, no `[functions."*"]`
    // defaults, and no unscoped lookup by the entry file's name.
    const result = await zipServer(SERVER_ENTRY, tmpDir, { basePath: FIXTURE })

    expect(result.memory).toBeUndefined()
    expect(result.vcpu).toBeUndefined()
    expect(result.region).toBeUndefined()
  })

  test('Omits the properties that only make sense for a function', async () => {
    const { serverManifest } = await bundleFixture({ path: SERVER_ENTRY })

    expect(serverManifest?.server).not.toHaveProperty('schedule')
    expect(serverManifest?.server).not.toHaveProperty('timeout')
    expect(serverManifest?.server).not.toHaveProperty('priority')
    expect(serverManifest?.server).not.toHaveProperty('invocationMode')
    expect(serverManifest?.server).not.toHaveProperty('generator')
  })

  test('Bundles a deploy that has a server and no functions', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
    const manifestPath = join(tmpDir, 'manifest.json')
    const result = await zipServer(SERVER_ENTRY, tmpDir, { basePath: FIXTURE, manifest: manifestPath })

    expect(result.path.endsWith(SERVER_ARCHIVE)).toBe(true)
    expect((await readManifest(manifestPath)).functions).toBeUndefined()
  })

  test('Leaves the manifest untouched when no server is given', async () => {
    const { functionsManifest, serverManifest } = await bundleFixture()

    expect(serverManifest).toBeUndefined()
    expect((functionsManifest as ServerManifest).server).toBeUndefined()
    expect(functionsManifest.functions.map(({ name }) => name)).toEqual(['hello'])
  })

  test('Traces a CommonJS server with NFT rather than the legacy bundler', async () => {
    const fixture = join(FIXTURES_DIR, 'netlify-server-cjs')
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })

    const result = await zipServer(join(fixture, 'netlify', 'server', 'index.js'), tmpDir, { basePath: fixture })

    // Left to the function heuristics this would be `zisi`, since the entry is
    // CommonJS and so reads as a v1 function.
    expect(result.bundler).toBe('nft')
    expect(result.runtimeVersion).toBeDefined()
  })

  describe('Whichever shape the server is written in', () => {
    // A framework server exports nothing, so the static analysis that tells a
    // v1 function from a v2 one reads it as v1. Nothing about the bundle may
    // follow from that.
    const SHAPES = {
      'framework mode': join(FIXTURES_DIR, 'netlify-server-framework'),
      'Netlify syntax': FIXTURE,
    }

    const bundleShape = async (fixture: string) => {
      const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
      const result = await zipServer(join(fixture, 'netlify', 'server', 'index.js'), tmpDir, { basePath: fixture })
      const extractDir = join(tmpDir, 'extracted')

      await mkdir(extractDir, { recursive: true })
      await execa('tar', ['-xzf', result.path, '-C', extractDir])

      return { contents: (await readdir(extractDir)).sort(), result }
    }

    test.each(Object.entries(SHAPES))('Carries the entry file the guest imports (%s)', async (_name, fixture) => {
      const { contents } = await bundleShape(fixture)

      // The guest imports a fixed path, so the bundle is only runnable if the
      // entry file is in it.
      expect(contents).toContain('___netlify-entry-point.mjs')
      expect(contents).toContain('___netlify-server.json')
    })

    test('Is bundled and versioned the same either way', async () => {
      const [framework, netlify] = await Promise.all(Object.values(SHAPES).map(bundleShape))

      expect(framework.result.bundler).toBe(netlify.result.bundler)
      expect(framework.result.runtimeVersion).toBe(netlify.result.runtimeVersion)
      expect(framework.result.runtimeVersion).toBeDefined()
    })
  })

  test('Fails the build when the server entry cannot be read, as a user error', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })

    const error = await zipServer(join(FIXTURE, 'netlify', 'server', 'nope.js'), tmpDir, {
      basePath: FIXTURE,
    }).catch((err: unknown) => err)

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toContain('Could not read the Netlify Server')

    // Carries the tag that makes the build report it as the user's file being
    // wrong rather than an internal failure.
    expect((error as FunctionBundlingUserError).customErrorInfo).toEqual({
      type: 'functionsBundling',
      location: { functionName: 'server', runtime: 'js' },
    })
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
    expect(((await readManifest(manifestPath)) as ServerManifest).server).toBeUndefined()
  })
})

describe('Netlify Server in-source configuration', () => {
  const FRAMEWORK_SERVER = `import { createServer } from 'node:http'

createServer((_req, res) => res.end('hello')).listen(process.env.PORT)
`

  const bundleSource = async (filename: string, source: string, extraFiles: Record<string, string> = {}) => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
    const serverDir = join(tmpDir, 'netlify', 'server')
    const destDir = join(tmpDir, 'out')

    await mkdir(serverDir, { recursive: true })
    await writeFile(join(serverDir, filename), source)

    // In-source `includedFiles` are relative to the entry file, so extra files
    // live next to it.
    for (const [name, contents] of Object.entries(extraFiles)) {
      await mkdir(dirname(join(serverDir, name)), { recursive: true })
      await writeFile(join(serverDir, name), contents)
    }

    const result = await zipServer(join(serverDir, filename), destDir, { basePath: tmpDir })
    const manifest = (await readManifest(join(destDir, 'manifest.json'))) as ServerManifest

    return { destDir, manifest, result }
  }

  test('Reads the config of a framework server that exports nothing else', async () => {
    const { manifest } = await bundleSource(
      'index.mjs',
      `${FRAMEWORK_SERVER}
export const config = { region: 'fra' }
`,
    )

    expect(manifest.server.region).toBe('fra')
  })

  test('Reads the config of a CommonJS framework server', async () => {
    const { manifest } = await bundleSource(
      'index.js',
      `const { createServer } = require('node:http')

module.exports = createServer((_req, res) => res.end('hello'))
module.exports.config = { region: 'fra' }
`,
    )

    expect(manifest.server.region).toBe('fra')
  })

  test('Bundles the files a framework server includes in its config', async () => {
    const { destDir, result } = await bundleSource(
      'index.mjs',
      `${FRAMEWORK_SERVER}
export const config = { includedFiles: ['data/**'] }
`,
      { 'data/seed.json': '{}' },
    )

    const extractDir = join(destDir, 'extracted')

    await mkdir(extractDir, { recursive: true })
    await execa('tar', ['-xzf', result.path, '-C', extractDir])

    expect(await readFile(join(extractDir, 'data', 'seed.json'), 'utf-8')).toBe('{}')
  })

  test('Reads the config of a server using the Netlify syntax', async () => {
    const { manifest } = await bundleSource(
      'index.mjs',
      `export default async () => new Response('hello')

export const config = { region: 'fra' }
`,
    )

    expect(manifest.server.region).toBe('fra')
  })

  test('Reads the config property of a default export object', async () => {
    const { manifest } = await bundleSource(
      'index.mjs',
      `export default {
  fetch: () => new Response('hello'),
  config: { region: 'fra' },
}
`,
    )

    expect(manifest.server.region).toBe('fra')
  })

  test('Fails the build on a property servers do not support, as a user error', async () => {
    const error = await bundleSource(
      'index.mjs',
      `${FRAMEWORK_SERVER}
export const config = { schedule: '@daily', region: 'fra' }
`,
    ).catch((err: unknown) => err)

    expect((error as Error).message).toBe("Netlify Server does not support the 'schedule' configuration property")
    expect((error as FunctionBundlingUserError).customErrorInfo).toEqual({
      type: 'functionsBundling',
      location: { functionName: 'server', runtime: 'js' },
    })
  })

  test('Narrows the paths a framework server claims', async () => {
    const { manifest } = await bundleSource(
      'index.mjs',
      `${FRAMEWORK_SERVER}
export const config = { path: '/api/*' }
`,
    )

    expect(manifest.server.routes).toEqual([
      { pattern: '/api/*', expression: '^\\/api(?:\\/(.*))\\/?$', prefer_static: true },
    ])
  })

  test('Claims every path in a list', async () => {
    const { manifest } = await bundleSource(
      'index.mjs',
      `export default async () => new Response('hello')

export const config = { path: ['/api/*', '/auth/login'] }
`,
    )

    expect(manifest.server.routes?.map(({ pattern }) => pattern)).toEqual(['/api/*', '/auth/login'])
    expect(manifest.server.routes?.every(({ prefer_static: preferStatic }) => preferStatic)).toBe(true)
  })

  test('Claims every path when the config names none', async () => {
    const { manifest } = await bundleSource(
      'index.mjs',
      `${FRAMEWORK_SERVER}
export const config = { region: 'fra' }
`,
    )

    expect(manifest.server.routes?.map(({ pattern }) => pattern)).toEqual(['/*'])
  })

  test('Reads the routes a server claims without bundling it', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
    const narrowed = join(tmpDir, 'narrowed.mjs')
    const unconfigured = join(tmpDir, 'unconfigured.mjs')

    await writeFile(narrowed, `${FRAMEWORK_SERVER}\nexport const config = { path: '/api/*' }\n`)
    await writeFile(unconfigured, FRAMEWORK_SERVER)

    const { manifest } = await bundleSource('index.mjs', await readFile(narrowed, 'utf-8'))

    expect(await getServerRoutes(narrowed)).toEqual(manifest.server.routes)
    expect((await getServerRoutes(unconfigured)).map(({ pattern }) => pattern)).toEqual(['/*'])
  })

  test('Fails the build on a path that does not start with a slash', async () => {
    const error = await bundleSource(
      'index.mjs',
      `${FRAMEWORK_SERVER}
export const config = { path: 'api/*' }
`,
    ).catch((err: unknown) => err)

    expect((error as Error).message).toBe("Netlify Server has a configuration error on 'path': Must start with a '/'")
  })

  test('Accepts the server regions in any casing', async () => {
    const { manifest } = await bundleSource(
      'index.mjs',
      `${FRAMEWORK_SERVER}
export const config = { region: 'IAD' }
`,
    )

    expect(manifest.server.region).toBe('iad')
  })

  test('Fails the build on a region only functions run in', async () => {
    const error = await bundleSource(
      'index.mjs',
      `${FRAMEWORK_SERVER}
export const config = { region: 'sfo' }
`,
    ).catch((err: unknown) => err)

    expect((error as Error).message).toMatch(/^Netlify Server has a configuration error on 'region': /)
  })

  test.each(['externalNodeModules', 'ignoredNodeModules'])(
    'Fails the build on %s, which only applies to esbuild',
    async (property) => {
      const error = await bundleSource(
        'index.mjs',
        `${FRAMEWORK_SERVER}
export const config = { ${property}: ['pg'] }
`,
      ).catch((err: unknown) => err)

      expect((error as Error).message).toBe(`Netlify Server does not support the '${property}' configuration property`)
    },
  )

  test('Fails the build on an invalid includedFiles', async () => {
    const error = await bundleSource(
      'index.mjs',
      `${FRAMEWORK_SERVER}
export const config = { includedFiles: 'data/**' }
`,
    ).catch((err: unknown) => err)

    expect((error as Error).message).toMatch(/^Netlify Server has a configuration error on 'includedFiles': /)
  })

  test.each([
    ['memory', '2048'],
    ['vcpu', '1'],
  ])('Fails the build on %s, which servers do not take', async (property, value) => {
    const error = await bundleSource(
      'index.mjs',
      `${FRAMEWORK_SERVER}
export const config = { ${property}: ${value} }
`,
    ).catch((err: unknown) => err)

    expect((error as Error).message).toBe(`Netlify Server does not support the '${property}' configuration property`)
  })
})

describe('findServerEntry', () => {
  const inTmpDir = async (files: string[]) => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
    const serverDir = join(tmpDir, 'netlify', 'server')

    await mkdir(serverDir, { recursive: true })
    await Promise.all(files.map((name) => writeFile(join(serverDir, name), '')))

    return serverDir
  }

  test('Finds the entrypoint, ignoring files that are not one', async () => {
    const serverDir = await inTmpDir(['index.mjs', 'helper.mjs', 'README.md'])

    expect(await findServerEntry(serverDir)).toBe(join(serverDir, 'index.mjs'))
  })

  test.each(['index.js', 'index.mjs', 'index.ts', 'index.mts'])('Accepts %s', async (name) => {
    const serverDir = await inTmpDir([name])

    expect(await findServerEntry(serverDir)).toBe(join(serverDir, name))
  })

  test('Returns undefined when the directory does not exist', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })

    expect(await findServerEntry(join(tmpDir, 'nope'))).toBeUndefined()
  })

  test('Returns undefined when the directory holds no entrypoint', async () => {
    const serverDir = await inTmpDir(['helper.mjs'])

    expect(await findServerEntry(serverDir)).toBeUndefined()
  })

  test('Returns undefined when the path is not a directory', async () => {
    const { path: tmpDir } = await getTmpDir({ prefix: 'zip-it-test', unsafeCleanup: true })
    const filePath = join(tmpDir, 'server')

    await writeFile(filePath, '')

    expect(await findServerEntry(filePath)).toBeUndefined()
  })

  test('Throws on more than one entrypoint', async () => {
    const serverDir = await inTmpDir(['index.js', 'index.ts'])

    await expect(findServerEntry(serverDir)).rejects.toThrow(
      `Found multiple server entrypoints in ${serverDir} (index.js, index.ts). A site can have one server only.`,
    )
  })
})
