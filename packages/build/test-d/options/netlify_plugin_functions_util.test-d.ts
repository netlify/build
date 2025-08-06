import type { NetlifyPluginUtils, ListedFunction, ListedFunctionFile } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'

test('utils functions list types', () => {
  type FunctionsList = NetlifyPluginUtils['functions']['list']
  expectTypeOf<ReturnType<FunctionsList>>().toEqualTypeOf<Promise<ListedFunction[]>>()
})

test('utils functions listAll types', () => {
  type FunctionsListAll = NetlifyPluginUtils['functions']['listAll']
  expectTypeOf<ReturnType<FunctionsListAll>>().toEqualTypeOf<Promise<ListedFunctionFile[]>>()
})

test('utils functions add types', () => {
  type FunctionsAdd = NetlifyPluginUtils['functions']['add']
  expectTypeOf<ReturnType<FunctionsAdd>>().toEqualTypeOf<Promise<void>>()
  expectTypeOf<FunctionsAdd>().toBeCallableWith('functionName')
})
