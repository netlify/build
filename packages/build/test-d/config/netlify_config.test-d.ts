import type { NetlifyConfig } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'
import type { JSONValue } from '../../src/types/utils/json_value.js'

test('netlify config plugins types', () => {
  type Plugin = NetlifyConfig['plugins'][number]
  expectTypeOf<Plugin['package']>().toEqualTypeOf<string>()
  expectTypeOf<Plugin['inputs']['testVar']>().toEqualTypeOf<JSONValue | undefined>()
})

test('netlify config edge functions types', () => {
  type EdgeFunction = NetlifyConfig['edge_functions'][number]
  expectTypeOf<EdgeFunction['path']>().toExtend<string | undefined>()
  expectTypeOf<EdgeFunction['function']>().toEqualTypeOf<string>()
})

test('netlify config headers types', () => {
  type Header = NetlifyConfig['headers'][number]
  expectTypeOf<Header['for']>().toEqualTypeOf<string>()
  expectTypeOf<Header['values']['testVar']>().toEqualTypeOf<string | string[] | undefined>()
})

test('netlify config redirects types', () => {
  type Redirect = NetlifyConfig['redirects'][number]
  expectTypeOf<Redirect['from']>().toEqualTypeOf<string>()
  expectTypeOf<Redirect['to']>().toEqualTypeOf<string | undefined>()
  expectTypeOf<Redirect['status']>().toEqualTypeOf<number | undefined>()
  expectTypeOf<Redirect['force']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Redirect['signed']>().toEqualTypeOf<string | undefined>()

  type QueryTestVar = NonNullable<Redirect['query']>['testVar']
  expectTypeOf<QueryTestVar>().toEqualTypeOf<string | undefined>()

  type HeadersTestVar = NonNullable<Redirect['headers']>['testVar']
  expectTypeOf<HeadersTestVar>().toEqualTypeOf<string | undefined>()

  type Conditions = NonNullable<Redirect['conditions']>
  expectTypeOf<Conditions['Language']>().toEqualTypeOf<readonly string[] | undefined>()
  expectTypeOf<Conditions['Cookie']>().toEqualTypeOf<readonly string[] | undefined>()
  expectTypeOf<Conditions['Country']>().toEqualTypeOf<readonly string[] | undefined>()
  expectTypeOf<Conditions['Role']>().toEqualTypeOf<readonly string[] | undefined>()
})
