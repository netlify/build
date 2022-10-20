import { promises as fs } from 'fs'
import { join, resolve } from 'path'
import { pathToFileURL } from 'url'

import del from 'del'
import { stub } from 'sinon'
import tmp from 'tmp-promise'
import { test, expect } from 'vitest'

import { fixturesDir } from '../test/util.js'

import { DenoBridge } from './bridge.js'
import { bundle } from './bundler.js'
import { getFunctionConfig } from './config.js'
import type { Declaration } from './declaration.js'
import { ImportMap } from './import_map.js'

const importMapFile = {
  baseURL: new URL('file:///some/path/import-map.json'),
  imports: {
    'alias:helper': pathToFileURL(join(fixturesDir, 'helper.ts')).toString(),
  },
}

test('`getFunctionConfig` extracts configuration properties from function file', async () => {
  const { path: tmpDir } = await tmp.dir()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir,
  })

  const functions = [
    // No config
    {
      expectedConfig: {},
      name: 'func1',
      source: `export default async () => new Response("Hello from function one")`,
    },

    // Empty config
    {
      expectedConfig: {},
      name: 'func2',
      source: `
        export default async () => new Response("Hello from function two")

        export const config = () => ({})
      `,
    },

    // Config with the wrong type
    {
      expectedConfig: {},
      name: 'func3',
      source: `
      export default async () => new Response("Hello from function two")

      export const config = {}
    `,
      userLog: /^'config' export in edge function at '(.*)' must be a function$/,
    },

    // Config with a syntax error
    {
      expectedConfig: {},
      name: 'func4',
      source: `
      export default async () => new Response("Hello from function two")

      export const config
    `,
      userLog: /^Could not load edge function at '(.*)'$/,
    },

    // Config that throws
    {
      expectedConfig: {},
      name: 'func5',
      source: `
          export default async () => new Response("Hello from function two")
    
          export const config = () => {
            throw new Error('uh-oh')
          }
        `,
      userLog: /^Error while running 'config' function in edge function at '(.*)'$/,
    },

    // Config with `path`
    {
      expectedConfig: { path: '/home' },
      name: 'func6',
      source: `
        export default async () => new Response("Hello from function three")

        export const config = () => ({ path: "/home" })
      `,
    },

    // Config that prints to stdout
    {
      expectedConfig: { path: '/home' },
      name: 'func7',
      source: `
        export default async () => new Response("Hello from function three")

        export const config = () => {
          console.log("Hello from config!")

          return { path: "/home" }
        }
      `,
      userLog: /^Hello from config!$/,
    },
  ]

  for (const func of functions) {
    const logger = {
      user: stub().resolves(),
      system: stub().resolves(),
    }
    const path = join(tmpDir, `${func.name}.js`)

    await fs.writeFile(path, func.source)

    const config = await getFunctionConfig(
      {
        name: func.name,
        path,
      },
      new ImportMap([importMapFile]),
      deno,
      logger,
    )

    expect(config).toEqual(func.expectedConfig)

    if (func.userLog) {
      expect(logger.user.firstCall.firstArg).toMatch(func.userLog)
    } else {
      expect(logger.user.callCount).toBe(0)
    }
  }

  await del(tmpDir, { force: true })
})

test('Ignores function paths from the in-source `config` function if the feature flag is off', async () => {
  const userDirectory = resolve(fixturesDir, 'with_config', 'netlify', 'edge-functions')
  const internalDirectory = resolve(fixturesDir, 'with_config', '.netlify', 'edge-functions')
  const tmpDir = await tmp.dir()
  const declarations: Declaration[] = []
  const result = await bundle([internalDirectory, userDirectory], tmpDir.path, declarations, {
    basePath: fixturesDir,
    featureFlags: {
      edge_functions_produce_eszip: true,
    },
    importMaps: [importMapFile],
  })
  const generatedFiles = await fs.readdir(tmpDir.path)

  expect(result.functions.length).toBe(6)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(tmpDir.path, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles, routes } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)
  expect(routes.length).toBe(0)

  await fs.rmdir(tmpDir.path, { recursive: true })
})

test('Loads function paths from the in-source `config` function', async () => {
  const userDirectory = resolve(fixturesDir, 'with_config', 'netlify', 'edge-functions')
  const internalDirectory = resolve(fixturesDir, 'with_config', '.netlify', 'edge-functions')
  const tmpDir = await tmp.dir()
  const declarations: Declaration[] = [
    {
      function: 'framework-func2',
      path: '/framework-func2',
    },
    {
      function: 'user-func2',
      path: '/user-func2',
    },
  ]
  const result = await bundle([internalDirectory, userDirectory], tmpDir.path, declarations, {
    basePath: fixturesDir,
    featureFlags: {
      edge_functions_config_export: true,
      edge_functions_produce_eszip: true,
    },
    importMaps: [importMapFile],
  })
  const generatedFiles = await fs.readdir(tmpDir.path)

  expect(result.functions.length).toBe(6)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(tmpDir.path, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles, routes, post_cache_routes: postCacheRoutes } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  expect(routes.length).toBe(5)
  expect(routes[0]).toEqual({ function: 'framework-func2', pattern: '^/framework-func2/?$' })
  expect(routes[1]).toEqual({ function: 'user-func2', pattern: '^/user-func2/?$' })
  expect(routes[2]).toEqual({ function: 'framework-func1', pattern: '^/framework-func1/?$' })
  expect(routes[3]).toEqual({ function: 'user-func1', pattern: '^/user-func1/?$' })
  expect(routes[4]).toEqual({ function: 'user-func3', pattern: '^/user-func3/?$' })

  expect(postCacheRoutes.length).toBe(1)
  expect(postCacheRoutes[0]).toEqual({ function: 'user-func4', pattern: '^/user-func4/?$' })

  await fs.rmdir(tmpDir.path, { recursive: true })
})
