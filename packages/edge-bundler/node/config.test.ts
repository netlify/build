import { promises as fs } from 'fs'
import { rm } from 'fs/promises'
import { join, resolve } from 'path'
import { pathToFileURL } from 'url'

import tmp from 'tmp-promise'
import { test, expect, vi, describe } from 'vitest'

import { fixturesDir, useFixture } from '../test/util.js'

import { DenoBridge } from './bridge.js'
import { bundle } from './bundler.js'
import { FunctionConfig, getFunctionConfig } from './config.js'
import type { Declaration } from './declaration.js'
import { ImportMap } from './import_map.js'
import { RateLimitAction, RateLimitAggregator } from './rate_limit.js'

const importMapFile = {
  baseURL: new URL('file:///some/path/import-map.json'),
  imports: {
    'alias:helper': pathToFileURL(join(fixturesDir, 'helper.ts')).toString(),
  },
}

const invalidDefaultExportErr = (path: string) =>
  `Default export in '${path}' must be a function. More on the Edge Functions API at https://ntl.fyi/edge-api.`

interface TestFunctions {
  error?: RegExp
  expectedConfig?: FunctionConfig
  name: string
  source: string
  testName: string
  userLog?: string
}

const functions: TestFunctions[] = [
  {
    testName: 'no config',
    expectedConfig: {},
    name: 'func1',
    source: `export default async () => new Response("Hello from function one")`,
  },
  {
    testName: 'empty config',
    expectedConfig: {},
    name: 'func2',
    source: `
        export default async () => new Response("Hello from function two")

        export const config = {}
      `,
  },
  {
    testName: 'config with wrong type',
    name: 'func3',
    source: `
      export default async () => new Response("Hello from function two")

      export const config = () => ({})
    `,
    error:
      /^The 'config' export in edge function at '(.*)' must be an object\. More on the Edge Functions API at https:\/\/ntl\.fyi\/edge-api\.$/,
  },
  {
    testName: 'config with syntax error',
    name: 'func4',
    source: `
      export default async () => new Response("Hello from function two")

      export const config
    `,
    error:
      /^Could not load edge function at '(.*)'\. More on the Edge Functions API at https:\/\/ntl\.fyi\/edge-api\.$/,
  },
  {
    testName: 'config with correct onError',
    expectedConfig: { onError: 'bypass' },
    name: 'func5',
    source: `
      export default async () => new Response("Hello from function two")
      export const config = { onError: "bypass" }
    `,
  },
  {
    testName: 'config with wrong onError',
    name: 'func6',
    source: `
      export default async () => new Response("Hello from function two")
      export const config = { onError: "foo" }
    `,
    error: /The 'onError' configuration property in edge function at .*/,
  },
  {
    testName: 'config with `path`',
    expectedConfig: { path: '/home' },
    name: 'func7',
    source: `
        export default async () => new Response("Hello from function three")

        export const config = { path: "/home" }
      `,
  },
  {
    testName: 'config with path, generator, name and onError`',
    expectedConfig: {
      path: '/home',
      generator: '@netlify/fake-plugin@1.0.0',
      name: 'a displayName',
      onError: 'bypass',
    },
    name: 'func8',
    source: `
        export default async () => new Response("Hello from function three")

        export const config = {
          path: "/home",
          generator: '@netlify/fake-plugin@1.0.0',
          name: 'a displayName',
          onError: 'bypass',
        }
      `,
  },
  {
    testName: 'config with ratelimit',
    expectedConfig: {
      path: '/ratelimit',
      name: 'a limit rate',
      rateLimit: {
        windowSize: 10,
        windowLimit: 100,
        aggregateBy: [RateLimitAggregator.IP, RateLimitAggregator.Domain],
      },
    },
    name: 'func9',
    source: `
        export default async () => new Response("Rate my limits")

        export const config = {
          path: "/ratelimit",
          rateLimit: {
            windowSize: 10,
            windowLimit: 100,
            aggregateBy: ["ip", "domain"],
          },
          name: 'a limit rate',
        }
      `,
  },
  {
    testName: 'config with rewrite',
    expectedConfig: {
      path: '/rewrite',
      name: 'a limit rewrite',
      rateLimit: {
        action: RateLimitAction.Rewrite,
        to: '/rewritten',
        windowSize: 20,
        windowLimit: 200,
        aggregateBy: [RateLimitAggregator.IP, RateLimitAggregator.Domain],
      },
    },
    name: 'func9',
    source: `
        export default async () => new Response("Rate my limits")

        export const config = {
          path: "/rewrite",
          rateLimit: {
            action: "rewrite",
            to: "/rewritten",
            windowSize: 20,
            windowLimit: 200,
            aggregateBy: ["ip", "domain"],
          },
          name: 'a limit rewrite',
        }
      `,
  },
]
describe('`getFunctionConfig` extracts configuration properties from function file', () => {
  test.each(functions)('$testName', async (func) => {
    const { path: tmpDir } = await tmp.dir()
    const deno = new DenoBridge({
      cacheDirectory: tmpDir,
    })

    const logger = {
      user: vi.fn().mockResolvedValue(null),
      system: vi.fn().mockResolvedValue(null),
    }
    const path = join(tmpDir, `${func.name}.js`)

    await fs.writeFile(path, func.source)

    const funcCall = () =>
      getFunctionConfig({
        func: {
          name: func.name,
          path,
        },
        importMap: new ImportMap([importMapFile]),
        deno,
        log: logger,
      })

    if (func.error) {
      await expect(funcCall()).rejects.toThrowError(func.error)
    } else if (func.userLog) {
      await expect(funcCall()).resolves.not.toThrowError()
      expect(logger.user).toHaveBeenCalledWith(expect.stringMatching(func.userLog))
    } else {
      const config = await funcCall()
      expect(config).toEqual(func.expectedConfig)
      expect(logger.user).not.toHaveBeenCalled()
    }

    await rm(tmpDir, { force: true, recursive: true, maxRetries: 10 })
  })
})

test('Loads function paths from the in-source `config` function', async () => {
  const { basePath, cleanup, distPath } = await useFixture('with_config')
  const userDirectory = resolve(basePath, 'netlify', 'edge-functions')
  const internalDirectory = resolve(basePath, '.netlify', 'edge-functions')
  const declarations: Declaration[] = [
    {
      function: 'framework-func2',
      path: '/framework-func2',
    },
    {
      function: 'user-func2',
      path: '/user-func2',
      method: ['PATCH'],
    },
  ]
  const result = await bundle([internalDirectory, userDirectory], distPath, declarations, {
    basePath,
    configPath: join(internalDirectory, 'config.json'),
  })
  const generatedFiles = await fs.readdir(distPath)

  expect(result.functions?.length).toBe(11)
  expect(generatedFiles.length).toBe(2)

  const manifestFile = await fs.readFile(resolve(distPath, 'manifest.json'), 'utf8')
  const manifest = JSON.parse(manifestFile)
  const { bundles, routes, post_cache_routes: postCacheRoutes, function_config: functionConfig } = manifest

  expect(bundles.length).toBe(1)
  expect(bundles[0].format).toBe('eszip2')
  expect(generatedFiles.includes(bundles[0].asset)).toBe(true)

  expect(routes.length).toBe(12)
  expect(routes[0]).toEqual({
    function: 'framework-func2',
    pattern: '^/framework-func2/?$',
    excluded_patterns: [],
    path: '/framework-func2',
  })
  expect(routes[1]).toEqual({
    function: 'user-func2',
    pattern: '^/user-func2/?$',
    excluded_patterns: [],
    path: '/user-func2',
    methods: ['PATCH'],
  })
  expect(routes[2]).toEqual({
    function: 'framework-func1',
    pattern: '^/framework-func1/?$',
    excluded_patterns: [],
    path: '/framework-func1',
  })
  expect(routes[3]).toEqual({
    function: 'framework-func3',
    pattern: '^/framework-func3(/.*)?$',
    excluded_patterns: ['^/framework-func3/excluded$'],
  })
  expect(routes[4]).toEqual({
    function: 'framework-func4',
    pattern: '^/framework-func4(/.*)?$',
    excluded_patterns: ['^/framework-func4/excluded$', '^/framework-func4-alt/excluded$'],
  })
  expect(routes[5]).toEqual({
    function: 'framework-func4',
    pattern: '^/framework-func4-alt(/.*)?$',
    excluded_patterns: ['^/framework-func4/excluded$', '^/framework-func4-alt/excluded$'],
  })
  expect(routes[6]).toEqual({
    function: 'user-func1',
    pattern: '^/user-func1/?$',
    excluded_patterns: [],
    path: '/user-func1',
    headers: {
      'x-must-be-there': {
        matcher: 'exists',
      },
      'x-must-match': {
        pattern: '^(foo|bar)$',
        matcher: 'regex',
      },
      'x-must-not-be-there': {
        matcher: 'missing',
      },
    },
  })
  expect(routes[7]).toEqual({
    function: 'user-func3',
    pattern: '^/user-func3/?$',
    excluded_patterns: [],
    path: '/user-func3',
  })
  expect(routes[8]).toEqual({
    function: 'user-func5',
    pattern: '^/user-func5(?:/(.*))/?$',
    excluded_patterns: ['^/user-func5/excluded/?$'],
    path: '/user-func5/*',
    methods: ['GET'],
  })
  expect(routes[9]).toEqual({
    function: 'user-func6',
    pattern: '^/user-func6(/.*)?$',
    excluded_patterns: ['^/user-func6/excluded$'],
  })
  expect(routes[10]).toEqual({
    function: 'user-func7',
    pattern: '^/user-func7(/.*)?$',
    excluded_patterns: ['^/user-func7/excluded$', '^/user-func7-alt/excluded$'],
  })
  expect(routes[11]).toEqual({
    function: 'user-func7',
    pattern: '^/user-func7-alt(/.*)?$',
    excluded_patterns: ['^/user-func7/excluded$', '^/user-func7-alt/excluded$'],
  })

  expect(postCacheRoutes.length).toBe(1)
  expect(postCacheRoutes[0]).toEqual({
    function: 'user-func4',
    pattern: '^/user-func4/?$',
    excluded_patterns: [],
    path: '/user-func4',
    methods: ['POST', 'PUT'],
  })

  expect(Object.keys(functionConfig)).toHaveLength(5)
  expect(functionConfig['user-func5']).toEqual({
    excluded_patterns: ['^/user-func5/excluded/?$'],
  })
  expect(functionConfig['user-func6']).toEqual({
    excluded_patterns: ['^/user-func6/excluded$'],
  })
  expect(functionConfig['user-func7']).toEqual({
    excluded_patterns: ['^/user-func7/excluded$', '^/user-func7-alt/excluded$'],
  })
  expect(functionConfig['framework-func3']).toEqual({
    excluded_patterns: ['^/framework-func3/excluded$'],
  })
  expect(functionConfig['framework-func4']).toEqual({
    excluded_patterns: ['^/framework-func4/excluded$', '^/framework-func4-alt/excluded$'],
  })

  await cleanup()
})

test('Passes validation if default export exists and is a function', async () => {
  const { path: tmpDir } = await tmp.dir()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir,
  })

  const func = {
    name: 'func1',
    source: `
        const func = () => new Response("Hello world!")
        export default func
      `,
  }

  const logger = {
    user: vi.fn().mockResolvedValue(null),
    system: vi.fn().mockResolvedValue(null),
  }
  const path = join(tmpDir, `${func.name}.ts`)

  await fs.writeFile(path, func.source)

  await expect(
    getFunctionConfig({
      func: {
        name: func.name,
        path,
      },
      importMap: new ImportMap([importMapFile]),
      deno,
      log: logger,
    }),
  ).resolves.not.toThrow()

  await rm(tmpDir, { force: true, recursive: true, maxRetries: 10 })
})

test('Fails validation if default export is not function', async () => {
  const { path: tmpDir } = await tmp.dir()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir,
  })

  const func = {
    name: 'func2',
    source: `
        const func = new Response("Hello world!")
        export default func
      `,
  }

  const logger = {
    user: vi.fn().mockResolvedValue(null),
    system: vi.fn().mockResolvedValue(null),
  }
  const path = join(tmpDir, `${func.name}.ts`)

  await fs.writeFile(path, func.source)

  const config = getFunctionConfig({
    func: {
      name: func.name,
      path,
    },
    importMap: new ImportMap([importMapFile]),
    deno,
    log: logger,
  })

  await expect(config).rejects.toThrowError(invalidDefaultExportErr(path))

  await rm(tmpDir, { force: true, recursive: true, maxRetries: 10 })
})

test('Fails validation if default export is not present', async () => {
  const { path: tmpDir } = await tmp.dir()
  const deno = new DenoBridge({
    cacheDirectory: tmpDir,
  })

  const func = {
    name: 'func3',
    source: `
        export const func = () => new Response("Hello world!")
      `,
  }

  const logger = {
    user: vi.fn().mockResolvedValue(null),
    system: vi.fn().mockResolvedValue(null),
  }
  const path = join(tmpDir, `${func.name}.ts`)

  await fs.writeFile(path, func.source)

  const config = getFunctionConfig({
    func: {
      name: func.name,
      path,
    },
    importMap: new ImportMap([importMapFile]),
    deno,
    log: logger,
  })

  await expect(config).rejects.toThrowError(invalidDefaultExportErr(path))

  await rm(tmpDir, { force: true, recursive: true, maxRetries: 10 })
})
