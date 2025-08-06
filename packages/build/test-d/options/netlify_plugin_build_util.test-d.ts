import type { NetlifyPluginUtils } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'

test('utils build failBuild types', () => {
  type BuildFailBuild = NetlifyPluginUtils['build']['failBuild']

  expectTypeOf<BuildFailBuild>().toBeCallableWith('message')
  expectTypeOf<BuildFailBuild>().toBeCallableWith('message', {})
  expectTypeOf<BuildFailBuild>().toBeCallableWith('message', { error: new Error('message') })
})

test('utils build failPlugin types', () => {
  type BuildFailPlugin = NetlifyPluginUtils['build']['failPlugin']

  expectTypeOf<BuildFailPlugin>().toBeCallableWith('message')
  expectTypeOf<BuildFailPlugin>().toBeCallableWith('message', {})
  expectTypeOf<BuildFailPlugin>().toBeCallableWith('message', { error: new Error('message') })
})

test('utils build cancelBuild types', () => {
  type BuildCancelBuild = NetlifyPluginUtils['build']['cancelBuild']

  expectTypeOf<BuildCancelBuild>().toBeCallableWith('message')
  expectTypeOf<BuildCancelBuild>().toBeCallableWith('message', {})
  expectTypeOf<BuildCancelBuild>().toBeCallableWith('message', { error: new Error('message') })
})
