import type { NetlifyPlugin, OnPreBuild, OnBuild, OnPostBuild, OnError, OnSuccess, OnEnd } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'

test('events noop types', () => {
  const noop = () => {}

  expectTypeOf(noop).toExtend<OnPreBuild>()
  expectTypeOf(noop).toExtend<OnBuild>()
  expectTypeOf(noop).toExtend<OnPostBuild>()
  expectTypeOf(noop).toExtend<OnError>()
  expectTypeOf(noop).toExtend<OnSuccess>()
  expectTypeOf(noop).toExtend<OnEnd>()

  const plugin: NetlifyPlugin = {
    onPreBuild: noop,
    onBuild: noop,
    onPostBuild: noop,
    onError: noop,
    onSuccess: noop,
    onEnd: noop,
  }
  expectTypeOf(plugin).toEqualTypeOf<NetlifyPlugin>()
})

test('onError argument types', () => {
  const handler: OnError = ({ error }) => {
    expectTypeOf(error).toEqualTypeOf<Error>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnError>()
})

test('onEnd argument types', () => {
  const handler: OnEnd = ({ error }) => {
    expectTypeOf(error).toEqualTypeOf<Error | undefined>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnEnd>()
})
