import chalk from 'chalk'
import { test, expect, describe } from 'vitest'

import { validateManifest, ManifestValidationError } from './index.js'

// We need to disable all color outputs for the tests as they are different on different platforms, CI, etc.
// This only works if this is the same instance of chalk that better-ajv-errors uses
chalk.level = 0

// Factory so we have a new object per test
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
      generator: '@netlify/fake-plugin@1.0.0',
    },
  ],
  post_cache_routes: [
    {
      name: 'name',
      function: 'hello',
      pattern: '^/hello/?$',
      generator: '@netlify/fake-plugin@1.0.0',
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

test('should throw ManifestValidationError with customErrorInfo', () => {
  try {
    validateManifest('manifest')
  } catch (error) {
    expect(error).toBeInstanceOf(ManifestValidationError)

    const { customErrorInfo } = error as ManifestValidationError
    expect(customErrorInfo).toBeDefined()
    expect(customErrorInfo.type).toBe('functionsBundling')
    return
  }

  expect.fail('should have thrown')
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

describe('import map URL', () => {
  test('should accept string value', () => {
    const manifest = getBaseManifest()
    manifest.import_map = 'file:///root/.netlify/edge-functions-dist/import_map.json'

    expect(() => validateManifest(manifest)).not.toThrowError()
  })

  test('should throw on wrong type', () => {
    const manifest = getBaseManifest()
    manifest.import_map = ['file:///root/.netlify/edge-functions-dist/import_map.json']

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })
})

describe('headers', () => {
  test('should accept valid headers with exists style', () => {
    const manifest = getBaseManifest()
    manifest.headers = {
      'x-custom-header': {
        style: 'exists'
      }
    }

    expect(() => validateManifest(manifest)).not.toThrowError()
  })

  test('should accept valid headers with missing style', () => {
    const manifest = getBaseManifest()
    manifest.headers = {
      'x-custom-header': {
        style: 'missing'
      }
    }

    expect(() => validateManifest(manifest)).not.toThrowError()
  })

  test('should accept valid headers with regex style and pattern', () => {
    const manifest = getBaseManifest()
    manifest.headers = {
      'x-custom-header': {
        style: 'regex',
        pattern: '^Bearer .+$'
      }
    }

    expect(() => validateManifest(manifest)).not.toThrowError()
  })

  test('should throw on missing style property', () => {
    const manifest = getBaseManifest()
    manifest.headers = {
      'x-custom-header': {
        pattern: '^Bearer .+'
      }
    }

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on invalid style value', () => {
    const manifest = getBaseManifest()
    manifest.headers = {
      'x-custom-header': {
        style: 'invalid'
      }
    }

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw when style is regex but pattern is missing', () => {
    const manifest = getBaseManifest()
    manifest.headers = {
      'x-custom-header': {
        style: 'regex'
      }
    }

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on invalid pattern format', () => {
    const manifest = getBaseManifest()
    manifest.headers = {
      'x-custom-header': {
        style: 'regex',
        pattern: '/^Bearer .+/'
      }
    }

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should throw on additional property in headers', () => {
    const manifest = getBaseManifest()
    manifest.headers = {
      'x-custom-header': {
        style: 'exists',
        foo: 'bar'
      }
    }

    expect(() => validateManifest(manifest)).toThrowErrorMatchingSnapshot()
  })

  test('should accept multiple headers with different styles', () => {
    const manifest = getBaseManifest()
    manifest.headers = {
      'x-exists-header': {
        style: 'exists'
      },
      'x-missing-header': {
        style: 'missing'
      },
      'authorization': {
        style: 'regex',
        pattern: '^Bearer [a-zA-Z0-9]+$'
      }
    }

    expect(() => validateManifest(manifest)).not.toThrowError()
  })
})
