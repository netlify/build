import type { OnPreBuild, NetlifyPluginUtils } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'

test('utils.cache.save types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    const ret = utils.cache.save('file')
    expectTypeOf(ret).toEqualTypeOf<Promise<boolean>>()
  }
  expectTypeOf<NetlifyPluginUtils['cache']['save']>().toBeCallableWith('file')
  expectTypeOf<NetlifyPluginUtils['cache']['save']>().toBeCallableWith(['file'])
  expectTypeOf<NetlifyPluginUtils['cache']['save']>().toBeCallableWith('file', {})
  expectTypeOf<NetlifyPluginUtils['cache']['save']>().toBeCallableWith('file', {
    ttl: 1,
    digests: ['digest'],
    cwd: '.',
  })
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('utils.cache.list types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    const r1 = utils.cache.list()
    const r2 = utils.cache.list({})
    expectTypeOf(r1).toEqualTypeOf<Promise<string[]>>()
    expectTypeOf(r2).toEqualTypeOf<Promise<string[]>>()
  }
  expectTypeOf<NetlifyPluginUtils['cache']['list']>().toBeCallableWith()
  expectTypeOf<NetlifyPluginUtils['cache']['list']>().toBeCallableWith({})
  expectTypeOf<NetlifyPluginUtils['cache']['list']>().toBeCallableWith({ depth: 1, cwd: '.' })
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('utils.cache.restore types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    const ret = utils.cache.restore('file')
    expectTypeOf(ret).toEqualTypeOf<Promise<boolean>>()
  }
  expectTypeOf<NetlifyPluginUtils['cache']['restore']>().toBeCallableWith('file')
  expectTypeOf<NetlifyPluginUtils['cache']['restore']>().toBeCallableWith(['file'])
  expectTypeOf<NetlifyPluginUtils['cache']['restore']>().toBeCallableWith('file', {})
  expectTypeOf<NetlifyPluginUtils['cache']['restore']>().toBeCallableWith('file', { cwd: '.' })
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('utils.cache.remove types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    const ret = utils.cache.remove('file')
    expectTypeOf(ret).toEqualTypeOf<Promise<boolean>>()
  }
  expectTypeOf<NetlifyPluginUtils['cache']['remove']>().toBeCallableWith('file')
  expectTypeOf<NetlifyPluginUtils['cache']['remove']>().toBeCallableWith(['file'])
  expectTypeOf<NetlifyPluginUtils['cache']['remove']>().toBeCallableWith('file', {})
  expectTypeOf<NetlifyPluginUtils['cache']['remove']>().toBeCallableWith('file', { cwd: '.' })
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('utils.cache.has types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    const ret = utils.cache.has('file')
    expectTypeOf(ret).toEqualTypeOf<Promise<boolean>>()
  }
  expectTypeOf<NetlifyPluginUtils['cache']['has']>().toBeCallableWith('file')
  expectTypeOf<NetlifyPluginUtils['cache']['has']>().toBeCallableWith(['file'])
  expectTypeOf<NetlifyPluginUtils['cache']['has']>().toBeCallableWith('file', {})
  expectTypeOf<NetlifyPluginUtils['cache']['has']>().toBeCallableWith('file', { cwd: '.' })
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})
