import type { NetlifyPlugin, OnPreBuild, OnBuild, OnPostBuild, OnError, OnSuccess, OnEnd } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'

test('event types', () => {
  const noop = function () {}

  expectTypeOf(noop).toExtend<NetlifyPlugin['onPreBuild']>()
  expectTypeOf(noop).toExtend<OnPreBuild>()
  expectTypeOf(noop).toExtend<OnBuild>()
  expectTypeOf(noop).toExtend<OnPostBuild>()
  expectTypeOf(noop).toExtend<OnError>()
  expectTypeOf(noop).toExtend<OnSuccess>()
  expectTypeOf(noop).toExtend<OnEnd>()
})

test('onError event types', () => {
  type ErrorParams = Parameters<OnError>[0]
  expectTypeOf<ErrorParams['error']>().toEqualTypeOf<Error>()
})

test('onEnd event types', () => {
  type EndParams = Parameters<OnEnd>[0]
  expectTypeOf<EndParams['error']>().toEqualTypeOf<Error | undefined>()
})
