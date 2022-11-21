/* eslint-disable max-nested-callbacks */
import { test, expect, describe } from 'vitest'

import { validateManifest, ManifestValidationError } from './index.js'

// Factory so we have a new object per test
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getBaseManifest = (): Record<string, any> => ({
  bundles: [
    {
      asset: 'f35baff44129a8f6be7db68590b2efd86ed4ba29000e2edbcaddc5d620d7d043.js',
      format: 'js',
    },
  ],
  routes: [
    {
      name: 'name',
      function: 'hello',
      pattern: '^/hello/?$',
    },
  ],
  post_cache_routes: [
    {
      name: 'name',
      function: 'hello',
      pattern: '^/hello/?$',
    },
  ],
  layers: [
    {
      flag: 'flag',
      name: 'name',
      local: 'local',
    },
  ],
  bundler_version: '1.6.0',
})

test('should not throw on valid manifest', () => {
  expect(() => validateManifest(getBaseManifest())).not.toThrowError()
})

test('should throw ManifestValidationError with correct message', () => {
  expect(() => validateManifest('manifest')).toThrowError(ManifestValidationError)
  expect(() => validateManifest('manifest')).toThrowError(/^Validation of Edge Functions manifest failed/)
})

test('should throw on additional property on root level', () => {
  const manifest = getBaseManifest()
  manifest.foo = 'bar'

  expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
})

test('should show multiple errors', () => {
  const manifest = getBaseManifest()
  manifest.foo = 'bar'
  manifest.baz = 'bar'

  expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
})

describe('bundle', () => {
  test('should throw on additional property in bundle', () => {
    const manifest = getBaseManifest()
    manifest.bundles[0].foo = 'bar'

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on missing asset', () => {
    const manifest = getBaseManifest()
    delete manifest.bundles[0].asset

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on missing format', () => {
    const manifest = getBaseManifest()
    delete manifest.bundles[0].format

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on invalid format', () => {
    const manifest = getBaseManifest()
    manifest.bundles[0].format = 'foo'

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })
})
describe('route', () => {
  test('should throw on additional property', () => {
    const manifest = getBaseManifest()
    manifest.routes[0].foo = 'bar'

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on invalid pattern', () => {
    const manifest = getBaseManifest()
    manifest.routes[0].pattern = '/^/hello/?$/'

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on missing function', () => {
    const manifest = getBaseManifest()
    delete manifest.routes[0].function

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on missing pattern', () => {
    const manifest = getBaseManifest()
    delete manifest.routes[0].pattern

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })
})

// No tests for post_cache_routes as schema shared with routes

describe('layers', () => {
  test('should throw on additional property', () => {
    const manifest = getBaseManifest()
    manifest.layers[0].foo = 'bar'

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on missing name', () => {
    const manifest = getBaseManifest()
    delete manifest.layers[0].name

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on missing flag', () => {
    const manifest = getBaseManifest()
    delete manifest.layers[0].flag

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })
})
/* eslint-enable max-nested-callbacks */
