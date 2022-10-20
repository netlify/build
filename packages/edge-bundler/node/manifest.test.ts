import { env } from 'process'

import { test, expect } from 'vitest'

import { generateManifest } from './manifest.js'

test('Generates a manifest with different bundles', () => {
  const bundle1 = {
    extension: '.ext1',
    format: 'format1',
    hash: '123456',
  }
  const bundle2 = {
    extension: '.ext2',
    format: 'format2',
    hash: '654321',
  }
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations = [{ function: 'func-1', path: '/f1' }]
  const manifest = generateManifest({ bundles: [bundle1, bundle2], declarations, functions })

  const expectedBundles = [
    { asset: bundle1.hash + bundle1.extension, format: bundle1.format },
    { asset: bundle2.hash + bundle2.extension, format: bundle2.format },
  ]
  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1/?$' }]

  expect(manifest.bundles).toEqual(expectedBundles)
  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.bundler_version).toBe(env.npm_package_version as string)
})

test('Generates a manifest with display names', () => {
  const functions = [
    { name: 'func-1', path: '/path/to/func-1.ts' },
    { name: 'func-2', path: '/path/to/func-2.ts' },
  ]
  const declarations = [
    { function: 'func-1', name: 'Display Name', path: '/f1/*' },
    { function: 'func-2', path: '/f2/*' },
  ]
  const manifest = generateManifest({ bundles: [], declarations, functions })

  const expectedRoutes = [
    { function: 'func-1', name: 'Display Name', pattern: '^/f1/.*/?$' },
    { function: 'func-2', pattern: '^/f2/.*/?$' },
  ]

  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.bundler_version).toBe(env.npm_package_version as string)
})

test('Excludes functions for which there are function files but no matching config declarations', () => {
  const bundle1 = {
    extension: '.ext2',
    format: 'format1',
    hash: '123456',
  }
  const functions = [
    { name: 'func-1', path: '/path/to/func-1.ts' },
    { name: 'func-2', path: '/path/to/func-2.ts' },
  ]
  const declarations = [{ function: 'func-1', path: '/f1' }]
  const manifest = generateManifest({ bundles: [bundle1], declarations, functions })

  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1/?$' }]

  expect(manifest.routes).toEqual(expectedRoutes)
})

test('Excludes functions for which there are config declarations but no matching function files', () => {
  const bundle1 = {
    extension: '.ext2',
    format: 'format1',
    hash: '123456',
  }
  const functions = [{ name: 'func-2', path: '/path/to/func-2.ts' }]
  const declarations = [
    { function: 'func-1', path: '/f1' },
    { function: 'func-2', path: '/f2' },
  ]
  const manifest = generateManifest({ bundles: [bundle1], declarations, functions })

  const expectedRoutes = [{ function: 'func-2', pattern: '^/f2/?$' }]

  expect(manifest.routes).toEqual(expectedRoutes)
})

test('Generates a manifest without bundles', () => {
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations = [{ function: 'func-1', path: '/f1' }]
  const manifest = generateManifest({ bundles: [], declarations, functions })

  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1/?$' }]

  expect(manifest.bundles).toEqual([])
  expect(manifest.routes).toEqual(expectedRoutes)
  expect(manifest.bundler_version).toBe(env.npm_package_version as string)
})

test('Generates a manifest with pre and post-cache routes', () => {
  const bundle1 = {
    extension: '.ext1',
    format: 'format1',
    hash: '123456',
  }
  const bundle2 = {
    extension: '.ext2',
    format: 'format2',
    hash: '654321',
  }
  const functions = [
    { name: 'func-1', path: '/path/to/func-1.ts' },
    { name: 'func-2', path: '/path/to/func-2.ts' },
    { name: 'func-3', path: '/path/to/func-3.ts' },
  ]
  const declarations = [
    { function: 'func-1', path: '/f1' },
    { function: 'func-2', mode: 'not_a_supported_mode', path: '/f2' },
    { function: 'func-3', mode: 'after-cache', path: '/f3' },
  ]
  const manifest = generateManifest({ bundles: [bundle1, bundle2], declarations, functions })

  const expectedBundles = [
    { asset: bundle1.hash + bundle1.extension, format: bundle1.format },
    { asset: bundle2.hash + bundle2.extension, format: bundle2.format },
  ]
  const expectedPreCacheRoutes = [
    { function: 'func-1', name: undefined, pattern: '^/f1/?$' },
    { function: 'func-2', name: undefined, pattern: '^/f2/?$' },
  ]
  const expectedPostCacheRoutes = [{ function: 'func-3', name: undefined, pattern: '^/f3/?$' }]

  expect(manifest.bundles).toEqual(expectedBundles)
  expect(manifest.routes).toEqual(expectedPreCacheRoutes)
  expect(manifest.post_cache_routes).toEqual(expectedPostCacheRoutes)
  expect(manifest.bundler_version).toBe(env.npm_package_version as string)
})
