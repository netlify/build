import { env } from 'process'

import test from 'ava'

import { generateManifest } from '../../node/manifest.js'

test('Generates a manifest with different bundles', (t) => {
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

  t.deepEqual(manifest.bundles, expectedBundles)
  t.deepEqual(manifest.routes, expectedRoutes)
  t.is(manifest.bundler_version, env.npm_package_version as string)
})

test('Excludes functions for which there are function files but no matching config declarations', (t) => {
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

  t.deepEqual(manifest.routes, expectedRoutes)
})

test('Excludes functions for which there are config declarations but no matching function files', (t) => {
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

  t.deepEqual(manifest.routes, expectedRoutes)
})

test('Generates a manifest without bundles', (t) => {
  const functions = [{ name: 'func-1', path: '/path/to/func-1.ts' }]
  const declarations = [{ function: 'func-1', path: '/f1' }]
  const manifest = generateManifest({ bundles: [], declarations, functions })

  const expectedRoutes = [{ function: 'func-1', pattern: '^/f1/?$' }]

  t.deepEqual(manifest.bundles, [])
  t.deepEqual(manifest.routes, expectedRoutes)
  t.is(manifest.bundler_version, env.npm_package_version as string)
})
