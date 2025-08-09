import type { OnPreBuild, ListedFunction, ListedFunctionFile } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'

test('utils.functions.list types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    const ret = utils.functions.list()
    expectTypeOf(ret).toEqualTypeOf<Promise<ListedFunction[]>>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('utils.functions.listAll types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    const ret = utils.functions.listAll()
    expectTypeOf(ret).toEqualTypeOf<Promise<ListedFunctionFile[]>>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('utils.functions.add types', () => {
  const handler: OnPreBuild = ({ utils }) => {
    const ret = utils.functions.add('functionName')
    expectTypeOf(ret).toEqualTypeOf<Promise<void>>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})
