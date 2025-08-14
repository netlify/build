import type { OnPreBuild } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'
import type { JSONValue } from '../../src/types/utils/json_value.js'

test('netlifyConfig.plugins types', () => {
  const handler: OnPreBuild = (ctx) => {
    const [plugin] = ctx.netlifyConfig.plugins

    expectTypeOf(plugin.package).toEqualTypeOf<string>()
    expectTypeOf(plugin.inputs.testVar).toEqualTypeOf<JSONValue | undefined>()
  }

  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('netlifyConfig.edge_functions types', () => {
  const handler: OnPreBuild = (ctx) => {
    const [edgeFunction] = ctx.netlifyConfig.edge_functions

    expectTypeOf(edgeFunction.path).toExtend<string | undefined>()
    expectTypeOf(edgeFunction.function).toEqualTypeOf<string>()
  }

  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('netlifyConfig.headers types', () => {
  const handler: OnPreBuild = (ctx) => {
    const [header] = ctx.netlifyConfig.headers

    expectTypeOf(header.for).toEqualTypeOf<string>()
    expectTypeOf(header.values.testVar).toEqualTypeOf<string | string[] | undefined>()
  }

  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('netlifyConfig.redirects types', () => {
  const handler: OnPreBuild = (ctx) => {
    const [redirect] = ctx.netlifyConfig.redirects

    expectTypeOf(redirect.from).toEqualTypeOf<string>()
    expectTypeOf(redirect.to).toEqualTypeOf<string | undefined>()
    expectTypeOf(redirect.status).toEqualTypeOf<number | undefined>()
    expectTypeOf(redirect.force).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(redirect.signed).toEqualTypeOf<string | undefined>()

    if (redirect.query !== undefined) {
      expectTypeOf(redirect.query.testVar).toEqualTypeOf<string | undefined>()
    }

    if (redirect.headers !== undefined) {
      expectTypeOf(redirect.headers.testVar).toEqualTypeOf<string | undefined>()
    }

    if (redirect.conditions !== undefined) {
      expectTypeOf(redirect.conditions.Language).toEqualTypeOf<readonly string[] | undefined>()
      expectTypeOf(redirect.conditions.Cookie).toEqualTypeOf<readonly string[] | undefined>()
      expectTypeOf(redirect.conditions.Country).toEqualTypeOf<readonly string[] | undefined>()
      expectTypeOf(redirect.conditions.Role).toEqualTypeOf<readonly string[] | undefined>()
    }
  }

  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})
