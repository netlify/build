import { describe, test, expect } from 'vitest'

// @ts-expect-error current tsconfig.json doesn't allow this, but I don't want to change it
import { version } from '../package.json' assert { type: 'json' }
import { getRouteMatcher } from '../test/util.js'

import { BundleFormat } from './bundle.js'
import { BundleError } from './bundle_error.js'
import { Cache, FunctionConfig } from './config.js'
import { Declaration } from './declaration.js'
import { generateManifest } from './manifest.js'
import { RateLimitAction, RateLimitAggregator } from './rate_limit.js'

test('Generates a manifest with different bundles', () => {
  const bundle1 = {
    extension: '.ext1',
    format: BundleFormat.ESZIP2,
    hash: '123456',
  }
  const bundle2 = {
    extension: '.ext2',
    format: BundleFormat.ESZIP2,
    hash: '654321',
  }
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations: Declaration[] = [{ function: 'func-1', path: '/f1' }]
  const { manifest } = generateManifest({ bundles: [bundle1, bundle2], declarations, functions })

  const expectedBundles = [
    { asset: bundle1.hash + bundle1.extension, format: bundle1.format },
    { asset: bundle2.hash + bundle2.extension, format: bundle2.format },
  ]
  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1/?$', excluded_patterns: [], path: '/f1' }]

  expect(manifest.bundles).toEqual(expectedBundles)
  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.bundler_version).toBe(version as string)
})

test('Generates a manifest with display names', () => {
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations: Declaration[] = [{ function: 'func-1', path: '/f1/*' }]

  const internalFunctionConfig: Record<string, FunctionConfig> = {
    'func-1': {
      name: 'Display Name',
    },
  }
  const { manifest } = generateManifest({
    bundles: [],
    declarations,
    functions,
    internalFunctionConfig,
  })

  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1(?:/(.*))/?$', excluded_patterns: [], path: '/f1/*' }]
  expect(manifest.function_config).toEqual({
    'func-1': { name: 'Display Name' },
  })
  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.bundler_version).toBe(version as string)
})

test('Generates a manifest with a generator field', () => {
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]

  const declarations: Declaration[] = [{ function: 'func-1', path: '/f1/*' }]
  const internalFunctionConfig: Record<string, FunctionConfig> = {
    'func-1': {
      generator: '@netlify/fake-plugin@1.0.0',
    },
  }
  const { manifest } = generateManifest({
    bundles: [],
    declarations,
    functions,
    internalFunctionConfig,
  })

  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1(?:/(.*))/?$', excluded_patterns: [], path: '/f1/*' }]
  const expectedFunctionConfig = { 'func-1': { generator: '@netlify/fake-plugin@1.0.0' } }
  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.function_config).toEqual(expectedFunctionConfig)
})

test('Generates a manifest with excluded paths and patterns', () => {
  const functions = [
    { name: 'func-1', path: '/path/to/func-1.ts' },
    { name: 'func-2', path: '/path/to/func-2.ts' },
    { name: 'func-3', path: '/path/to/func-3.ts' },
  ]
  const declarations: Declaration[] = [
    { function: 'func-1', path: '/f1/*', excludedPath: '/f1/exclude' },
    { function: 'func-2', pattern: '^/f2(?:/(.*))/?$', excludedPattern: ['^/f2/exclude$', '^/f2/exclude-as-well$'] },
    { function: 'func-3', path: '/*', excludedPath: '/**/*.html' },
  ]
  const { manifest } = generateManifest({
    bundles: [],
    declarations,
    functions,
  })
  const expectedRoutes = [
    { function: 'func-1', pattern: '^/f1(?:/(.*))/?$', excluded_patterns: ['^/f1/exclude/?$'], path: '/f1/*' },
    {
      function: 'func-2',
      pattern: '^/f2(?:/(.*))/?$',
      excluded_patterns: ['^/f2/exclude$', '^/f2/exclude-as-well$'],
    },
    {
      function: 'func-3',
      pattern: '^(?:/(.*))/?$',
      excluded_patterns: ['^(?:/((?:.*)(?:/(?:.*))*))?(?:/(.*))\\.html/?$'],
      path: '/*',
    },
  ]

  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.function_config).toEqual({})
  expect(manifest.bundler_version).toBe(version as string)

  const matcher = getRouteMatcher(manifest)

  expect(matcher('/f1/hello')?.function).toBe('func-1')
  expect(matcher('/grandparent/parent/child/grandchild.html')?.function).toBeUndefined()
})

test('TOML-defined paths can be combined with ISC-defined excluded paths', () => {
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations: Declaration[] = [{ function: 'func-1', path: '/f1/*' }]
  const userFunctionConfig: Record<string, FunctionConfig> = {
    'func-1': { excludedPath: '/f1/exclude' },
  }
  const { manifest } = generateManifest({
    bundles: [],
    declarations,
    functions,
    userFunctionConfig,
  })
  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1(?:/(.*))/?$', excluded_patterns: [], path: '/f1/*' }]

  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.function_config).toEqual({
    'func-1': { excluded_patterns: ['^/f1/exclude/?$'] },
  })
  expect(manifest.bundler_version).toBe(version as string)
})

test('Filters out internal in-source configurations in user created functions', () => {
  const functions = [
    { name: 'func-1', path: '/path/to/func-1.ts' },
    { name: 'func-2', path: '/path/to/func-2.ts' },
  ]
  const declarations: Declaration[] = [
    { function: 'func-1', path: '/f1/*' },
    { function: 'func-2', pattern: '^/f2(?:/(.*))/?$' },
  ]
  const userFunctionConfig: Record<string, FunctionConfig> = {
    'func-1': {
      onError: '/custom-error',
      cache: Cache.Manual,
      excludedPath: '/f1/exclude',
      path: '/path/to/func-1.ts',
      name: 'User function',
      generator: 'fake-generator',
    },
  }
  const internalFunctionConfig: Record<string, FunctionConfig> = {
    'func-2': {
      onError: 'bypass',
      cache: Cache.Off,
      excludedPath: '/f2/exclude',
      path: '/path/to/func-2.ts',
      name: 'Internal function',
      generator: 'internal-generator',
    },
  }
  const { manifest } = generateManifest({
    bundles: [],
    declarations,
    functions,
    userFunctionConfig,
    internalFunctionConfig,
  })
  expect(manifest.function_config).toEqual({
    'func-1': {
      on_error: '/custom-error',
      excluded_patterns: ['^/f1/exclude/?$'],
    },
    'func-2': {
      on_error: 'bypass',
      cache: Cache.Off,
      name: 'Internal function',
      generator: 'internal-generator',
      excluded_patterns: ['^/f2/exclude/?$'],
    },
  })
})

test('excludedPath from ISC goes into function_config, TOML goes into routes', () => {
  const functions = [{ name: 'customisation', path: '/path/to/customisation.ts' }]
  const declarations: Declaration[] = [
    { function: 'customisation', path: '/showcases/*' },
    { function: 'customisation', path: '/checkout/*', excludedPath: ['/*/terms-and-conditions'] },
  ]
  const userFunctionConfig: Record<string, FunctionConfig> = {
    customisation: {
      excludedPath: ['/*.css', '/*.jpg'],
    },
  }
  const internalFunctionConfig: Record<string, FunctionConfig> = {}
  const { manifest } = generateManifest({
    bundles: [],
    declarations,
    functions,
    userFunctionConfig,
    internalFunctionConfig,
  })
  expect(manifest.routes).toEqual([
    {
      function: 'customisation',
      pattern: '^/showcases(?:/(.*))/?$',
      excluded_patterns: [],
      path: '/showcases/*',
    },
    {
      function: 'customisation',
      pattern: '^/checkout(?:/(.*))/?$',
      excluded_patterns: ['^(?:/(.*))/terms-and-conditions/?$'],
      path: '/checkout/*',
    },
  ])
  expect(manifest.function_config).toEqual({
    customisation: {
      excluded_patterns: ['^(?:/(.*))\\.css/?$', '^(?:/(.*))\\.jpg/?$'],
    },
  })

  const matcher = getRouteMatcher(manifest)

  expect(matcher('/showcases/boho-matcher')).toBeDefined()
  expect(matcher('/checkout/address')).toBeDefined()
  expect(matcher('/checkout/terms-and-conditions')).toBeUndefined()
  expect(matcher('/checkout/scrooge-mc-duck-animation.css')).toBeUndefined()
  expect(matcher('/showcases/boho-matcher/expensive-chair.jpg')).toBeUndefined()
})

test('URLPattern named groups are supported', () => {
  const functions = [{ name: 'customisation', path: '/path/to/customisation.ts' }]
  const declarations: Declaration[] = [{ function: 'customisation', path: '/products/:productId' }]
  const userFunctionConfig: Record<string, FunctionConfig> = {}
  const internalFunctionConfig: Record<string, FunctionConfig> = {}
  const { manifest } = generateManifest({
    bundles: [],
    declarations,
    functions,
    userFunctionConfig,
    internalFunctionConfig,
  })
  expect(manifest.routes).toEqual([
    {
      function: 'customisation',
      pattern: '^/products(?:/([^/]+?))/?$',
      excluded_patterns: [],
      path: '/products/:productId',
    },
  ])

  const matcher = getRouteMatcher(manifest)

  expect(matcher('/products/jigsaw-doweling-jig')).toBeDefined()
})

test('Invalid Path patterns throw bundling errors', () => {
  const functions = [{ name: 'customisation', path: '/path/to/customisation.ts' }]
  const declarations: Declaration[] = [{ function: 'customisation', path: '/https://foo.netlify.app/' }]
  const userFunctionConfig: Record<string, FunctionConfig> = {}
  const internalFunctionConfig: Record<string, FunctionConfig> = {}

  expect(() =>
    generateManifest({
      bundles: [],
      declarations,
      functions,
      userFunctionConfig,
      internalFunctionConfig,
    }),
  ).toThrowError(BundleError)
})

test('Includes failure modes in manifest', () => {
  const functions = [
    { name: 'func-1', path: '/path/to/func-1.ts' },
    { name: 'func-2', path: '/path/to/func-2.ts' },
  ]
  const declarations: Declaration[] = [
    { function: 'func-1', path: '/f1/*' },
    { function: 'func-2', pattern: '^/f2(?:/(.*))/?$' },
  ]
  const userFunctionConfig: Record<string, FunctionConfig> = {
    'func-1': {
      onError: '/custom-error',
    },
  }
  const { manifest } = generateManifest({ bundles: [], declarations, functions, userFunctionConfig })
  expect(manifest.function_config).toEqual({
    'func-1': { on_error: '/custom-error' },
  })
})

test('Excludes functions for which there are function files but no matching config declarations', () => {
  const bundle1 = {
    extension: '.ext2',
    format: BundleFormat.ESZIP2,
    hash: '123456',
  }
  const functions = [
    { name: 'func-1', path: '/path/to/func-1.ts' },
    { name: 'func-2', path: '/path/to/func-2.ts' },
  ]
  const declarations: Declaration[] = [{ function: 'func-1', path: '/f1' }]
  const { manifest } = generateManifest({ bundles: [bundle1], declarations, functions })

  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1/?$', excluded_patterns: [], path: '/f1' }]

  expect(manifest.routes).toEqual(expectedRoutes)
})

test('Excludes functions for which there are config declarations but no matching function files', () => {
  const bundle1 = {
    extension: '.ext2',
    format: BundleFormat.ESZIP2,
    hash: '123456',
  }
  const functions = [{ name: 'func-2', path: '/path/to/func-2.ts' }]
  const declarations: Declaration[] = [
    { function: 'func-1', path: '/f1' },
    { function: 'func-2', path: '/f2' },
  ]
  const { manifest } = generateManifest({ bundles: [bundle1], declarations, functions })

  const expectedRoutes = [{ function: 'func-2', pattern: '^/f2/?$', excluded_patterns: [], path: '/f2' }]

  expect(manifest.routes).toEqual(expectedRoutes)
})

test('Generates a manifest without bundles', () => {
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations: Declaration[] = [{ function: 'func-1', path: '/f1' }]
  const { manifest } = generateManifest({ bundles: [], declarations, functions })

  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1/?$', excluded_patterns: [], path: '/f1' }]

  expect(manifest.bundles).toEqual([])
  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.bundler_version).toBe(version as string)
})

test('Generates a manifest with pre and post-cache routes', () => {
  const bundle1 = {
    extension: '.ext1',
    format: BundleFormat.ESZIP2,
    hash: '123456',
  }
  const bundle2 = {
    extension: '.ext2',
    format: BundleFormat.ESZIP2,
    hash: '654321',
  }
  const functions = [
    { name: 'func-1', path: '/path/to/func-1.ts' },
    { name: 'func-2', path: '/path/to/func-2.ts' },
    { name: 'func-3', path: '/path/to/func-3.ts' },
  ]
  const declarations: Declaration[] = [
    { function: 'func-1', path: '/f1' },
    { function: 'func-2', cache: 'not_a_supported_value', path: '/f2' },
    { function: 'func-3', cache: 'manual', path: '/f3' },
  ]
  const { manifest } = generateManifest({ bundles: [bundle1, bundle2], declarations, functions })

  const expectedBundles = [
    { asset: bundle1.hash + bundle1.extension, format: bundle1.format },
    { asset: bundle2.hash + bundle2.extension, format: bundle2.format },
  ]
  const expectedPreCacheRoutes = [
    { function: 'func-1', name: undefined, pattern: '^/f1/?$', excluded_patterns: [], path: '/f1' },
    { function: 'func-2', name: undefined, pattern: '^/f2/?$', excluded_patterns: [], path: '/f2' },
  ]
  const expectedPostCacheRoutes = [
    { function: 'func-3', name: undefined, pattern: '^/f3/?$', excluded_patterns: [], path: '/f3' },
  ]

  expect(manifest.bundles).toEqual(expectedBundles)
  expect(manifest.routes).toEqual(expectedPreCacheRoutes)
  expect(manifest.post_cache_routes).toEqual(expectedPostCacheRoutes)
  expect(manifest.bundler_version).toBe(version as string)
})

test('Generates a manifest with layers', () => {
  const functions = [
    { name: 'func-1', path: '/path/to/func-1.ts' },
    { name: 'func-2', path: '/path/to/func-2.ts' },
  ]
  const declarations: Declaration[] = [
    { function: 'func-1', path: '/f1/*' },
    { function: 'func-2', path: '/f2/*' },
  ]
  const expectedRoutes = [
    { function: 'func-1', pattern: '^/f1(?:/(.*))/?$', excluded_patterns: [], path: '/f1/*' },
    { function: 'func-2', pattern: '^/f2(?:/(.*))/?$', excluded_patterns: [], path: '/f2/*' },
  ]
  const layers = [
    {
      name: 'onion',
      flag: 'edge_functions_onion_layer',
    },
  ]
  const { manifest: manifest1 } = generateManifest({
    bundles: [],
    declarations,
    functions,
  })
  const { manifest: manifest2 } = generateManifest({
    bundles: [],
    declarations,
    functions,
    layers,
  })

  expect(manifest1.routes).toEqual(expectedRoutes)
  expect(manifest1.layers).toEqual([])

  expect(manifest2.routes).toEqual(expectedRoutes)
  expect(manifest2.layers).toEqual(layers)
})

test('Accepts regular expressions with lookaheads', () => {
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations = [{ function: 'func-1', pattern: '^\\/((?!api|_next\\/static|_next\\/image|favicon.ico).*)$' }]
  const { manifest } = generateManifest({
    bundles: [],
    declarations,
    functions,
  })
  const [route] = manifest.routes
  const regexp = new RegExp(route.pattern)

  expect(regexp.test('/foo')).toBeTruthy()
  expect(regexp.test('/_next/static/foo')).toBeFalsy()
})

test('Accepts regular expressions with named capture groups', () => {
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations = [{ function: 'func-1', pattern: '^/(?<name>\\w+)$' }]
  const { manifest } = generateManifest({ bundles: [], declarations, functions })

  expect(manifest.routes).toEqual([{ function: 'func-1', pattern: '^/(?<name>\\w+)$', excluded_patterns: [] }])
})

test('Returns functions without a declaration and unrouted functions', () => {
  const bundle = {
    extension: '.ext1',
    format: BundleFormat.ESZIP2,
    hash: '123456',
  }
  const functions = [
    { name: 'func-1', path: '/path/to/func-1.ts' },
    { name: 'func-2', path: '/path/to/func-2.ts' },
    { name: 'func-4', path: '/path/to/func-4.ts' },
  ]
  const declarations: Declaration[] = [
    { function: 'func-1', path: '/f1' },
    { function: 'func-3', path: '/f3' },

    // @ts-expect-error Error is expected due to neither `path` or `pattern`
    // being present.
    { function: 'func-4', name: 'Some name' },
  ]
  const { declarationsWithoutFunction, manifest, unroutedFunctions } = generateManifest({
    bundles: [bundle],
    declarations,
    functions,
  })
  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1/?$', excluded_patterns: [], path: '/f1' }]

  expect(manifest.routes).toEqual(expectedRoutes)
  expect(declarationsWithoutFunction).toEqual(['func-3'])
  expect(unroutedFunctions).toEqual(['func-2', 'func-4'])
})

test('Generates a manifest with rate limit config', () => {
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations: Declaration[] = [{ function: 'func-1', path: '/f1/*' }]

  const userFunctionConfig: Record<string, FunctionConfig> = {
    'func-1': { rateLimit: { windowLimit: 100, windowSize: 60 } },
  }
  const { manifest } = generateManifest({
    bundles: [],
    declarations,
    functions,
    userFunctionConfig,
  })

  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1(?:/(.*))/?$', excluded_patterns: [], path: '/f1/*' }]
  const expectedFunctionConfig = {
    'func-1': {
      traffic_rules: {
        action: {
          type: 'rate_limit',
          config: {
            rate_limit_config: {
              window_limit: 100,
              window_size: 60,
              algorithm: 'sliding_window',
            },
            aggregate: {
              keys: [{ type: 'domain' }],
            },
          },
        },
      },
    },
  }
  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.function_config).toEqual(expectedFunctionConfig)
})

test('Generates a manifest with rewrite config', () => {
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations: Declaration[] = [{ function: 'func-1', path: '/f1/*' }]

  const userFunctionConfig: Record<string, FunctionConfig> = {
    'func-1': {
      rateLimit: {
        action: RateLimitAction.Rewrite,
        to: '/new_path',
        windowLimit: 100,
        windowSize: 60,
        aggregateBy: [RateLimitAggregator.Domain, RateLimitAggregator.IP],
      },
    },
  }
  const { manifest } = generateManifest({
    bundles: [],
    declarations,
    functions,
    userFunctionConfig,
  })

  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1(?:/(.*))/?$', excluded_patterns: [], path: '/f1/*' }]
  const expectedFunctionConfig = {
    'func-1': {
      traffic_rules: {
        action: {
          type: 'rewrite',
          config: {
            to: '/new_path',
            rate_limit_config: {
              window_limit: 100,
              window_size: 60,
              algorithm: 'sliding_window',
            },
            aggregate: {
              keys: [{ type: 'domain' }, { type: 'ip' }],
            },
          },
        },
      },
    },
  }
  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.function_config).toEqual(expectedFunctionConfig)
})

describe('Header matching', () => {
  test('Throws a bundling error if the type is incorrect', () => {
    const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]

    expect(() =>
      generateManifest({
        bundles: [],

        // @ts-expect-error Incorrect type
        declarations: [{ function: 'func-1', path: '/f1/*', header: 'foo' }],
        functions,
      }),
    ).toThrowError(BundleError)

    expect(() =>
      generateManifest({
        bundles: [],

        declarations: [
          {
            function: 'func-1',
            path: '/f1/*',
            header: {
              'x-correct': true,

              // @ts-expect-error Incorrect type
              'x-not-correct': {
                problem: true,
              },
            },
          },
        ],
        functions,
      }),
    ).toThrowError(BundleError)
  })

  test('Writes header matching rules to the manifest', () => {
    const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
    const declarations: Declaration[] = [
      {
        function: 'func-1',
        path: '/f1/*',
        header: {
          'x-present': true,
          'x-also-present': true,
          'x-absent': false,
          'x-match-prefix': '^prefix(.*)',
          'x-match-exact': 'exact',
          'x-match-suffix': '(.*)suffix$',
        },
      },
    ]
    const { manifest } = generateManifest({
      bundles: [],
      declarations,
      functions,
    })

    const expectedRoutes = [
      {
        function: 'func-1',
        pattern: '^/f1(?:/(.*))/?$',
        excluded_patterns: [],
        path: '/f1/*',
        headers: {
          'x-absent': {
            matcher: 'missing',
          },
          'x-also-present': {
            matcher: 'exists',
          },
          'x-match-exact': {
            pattern: '^exact$',
            matcher: 'regex',
          },
          'x-match-prefix': {
            pattern: '^prefix(.*)$',
            matcher: 'regex',
          },
          'x-match-suffix': {
            pattern: '^(.*)suffix$',
            matcher: 'regex',
          },
          'x-present': {
            matcher: 'exists',
          },
        },
      },
    ]
    expect(manifest.routes).toEqual(expectedRoutes)
  })
})
