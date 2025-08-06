import type { NetlifyPluginUtils } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'

test('utils cache save types', () => {
  type CacheSave = NetlifyPluginUtils['cache']['save']

  expectTypeOf<ReturnType<CacheSave>>().toEqualTypeOf<Promise<boolean>>()
  expectTypeOf<CacheSave>().toBeCallableWith('file')
  expectTypeOf<CacheSave>().toBeCallableWith(['file'])
  expectTypeOf<CacheSave>().toBeCallableWith('file', {})
  expectTypeOf<CacheSave>().toBeCallableWith('file', { ttl: 1, digests: ['digest'], cwd: '.' })
})

test('utils cache list types', () => {
  type CacheList = NetlifyPluginUtils['cache']['list']

  expectTypeOf<ReturnType<CacheList>>().toEqualTypeOf<Promise<string[]>>()
  expectTypeOf<CacheList>().toBeCallableWith({})
  expectTypeOf<CacheList>().toBeCallableWith()
  expectTypeOf<CacheList>().toBeCallableWith({ depth: 1, cwd: '.' })
})

test('utils cache restore types', () => {
  type CacheRestore = NetlifyPluginUtils['cache']['restore']

  expectTypeOf<ReturnType<CacheRestore>>().toEqualTypeOf<Promise<boolean>>()
  expectTypeOf<CacheRestore>().toBeCallableWith('file')
  expectTypeOf<CacheRestore>().toBeCallableWith(['file'])
  expectTypeOf<CacheRestore>().toBeCallableWith('file', {})
  expectTypeOf<CacheRestore>().toBeCallableWith('file', { cwd: '.' })
})

test('utils cache remove types', () => {
  type CacheRemove = NetlifyPluginUtils['cache']['remove']

  expectTypeOf<ReturnType<CacheRemove>>().toEqualTypeOf<Promise<boolean>>()
  expectTypeOf<CacheRemove>().toBeCallableWith('file')
  expectTypeOf<CacheRemove>().toBeCallableWith(['file'])
  expectTypeOf<CacheRemove>().toBeCallableWith('file', {})
  expectTypeOf<CacheRemove>().toBeCallableWith('file', { cwd: '.' })
})

test('utils cache has types', () => {
  type CacheHas = NetlifyPluginUtils['cache']['has']

  expectTypeOf<ReturnType<CacheHas>>().toEqualTypeOf<Promise<boolean>>()
  expectTypeOf<CacheHas>().toBeCallableWith('file')
  expectTypeOf<CacheHas>().toBeCallableWith(['file'])
  expectTypeOf<CacheHas>().toBeCallableWith('file', {})
  expectTypeOf<CacheHas>().toBeCallableWith('file', { cwd: '.' })
})
