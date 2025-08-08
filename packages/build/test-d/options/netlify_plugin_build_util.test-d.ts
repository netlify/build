import type { OnPreBuild } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'

test('utils.build.failBuild types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    utils.build.failBuild('message')
    utils.build.failBuild('message', {})
    utils.build.failBuild('message', { error: new Error('message') })
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('utils.build.failPlugin types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    utils.build.failPlugin('message')
    utils.build.failPlugin('message', {})
    utils.build.failPlugin('message', { error: new Error('message') })
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('utils.build.cancelBuild types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    utils.build.cancelBuild('message')
    utils.build.cancelBuild('message', {})
    utils.build.cancelBuild('message', { error: new Error('message') })
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})
