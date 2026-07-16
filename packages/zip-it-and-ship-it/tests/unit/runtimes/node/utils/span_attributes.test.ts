import { describe, expect, test } from 'vitest'

import type { FeatureFlags } from '../../../../../src/feature_flags.js'
import {
  getBundleResultSpanAttributes,
  getFunctionBundleSpanAttributes,
} from '../../../../../src/runtimes/node/utils/span_attributes.js'
import type { ZipFunctionResult } from '../../../../../src/runtimes/runtime.js'

describe('getFunctionBundleSpanAttributes', () => {
  test('maps function and bundler metadata to span attributes', () => {
    const featureFlags = { traceWithNft: true } as FeatureFlags

    expect(
      getFunctionBundleSpanAttributes({
        featureFlags,
        name: 'my-func',
        generator: '@netlify/some-plugin',
        runtimeName: 'js',
        runtimeAPIVersion: 2,
        bundlerName: 'nft',
        bundlerReason: 'flag-forced-nft',
      }),
    ).toStrictEqual({
      feature_flags: JSON.stringify(featureFlags),
      'function.name': 'my-func',
      'function.generator': '@netlify/some-plugin',
      'function.runtime': 'js',
      'function.runtime_api_version': 2,
      'bundler.name': 'nft',
      'bundler.reason': 'flag-forced-nft',
    })
  })

  test('leaves the generator attribute undefined for functions without one', () => {
    const attributes = getFunctionBundleSpanAttributes({
      featureFlags: {} as FeatureFlags,
      name: 'fn',
      generator: undefined,
      runtimeName: 'js',
      runtimeAPIVersion: 1,
      bundlerName: 'zisi',
      bundlerReason: 'zisi-default',
    })

    expect(attributes['function.generator']).toBeUndefined()
    expect(attributes['bundler.reason']).toBe('zisi-default')
  })
})

describe('getBundleResultSpanAttributes', () => {
  test('counts warnings and errors and includes the archive size', () => {
    const result = {
      path: '/tmp/fn.zip',
      bundlerWarnings: [{}, {}],
      bundlerErrors: [{}],
    } as unknown as ZipFunctionResult

    expect(getBundleResultSpanAttributes(result, 2048)).toStrictEqual({
      'bundler.warnings_count': 2,
      'bundler.errors_count': 1,
      'bundle.size_bytes': 2048,
    })
  })

  test('defaults the counts to zero and tolerates an unknown size', () => {
    const result = { path: '/tmp/fn.js' } as unknown as ZipFunctionResult

    expect(getBundleResultSpanAttributes(result, undefined)).toStrictEqual({
      'bundler.warnings_count': 0,
      'bundler.errors_count': 0,
      'bundle.size_bytes': undefined,
    })
  })
})
