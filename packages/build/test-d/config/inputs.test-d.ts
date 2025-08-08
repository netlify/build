import type { OnPreBuild } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'
import type { JSONValue } from '../../src/types/utils/json_value.js'

test('inputs generic types', () => {
  const handler: OnPreBuild = (ctx) => {
    expectTypeOf(ctx.inputs.testVar).toExtend<JSONValue | undefined>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('inputs specific types', () => {
  const handler: OnPreBuild<{ testVar: boolean }> = (ctx) => {
    expectTypeOf(ctx.inputs.testVar).toEqualTypeOf<boolean>()
    expectTypeOf(ctx.inputs).not.toHaveProperty('otherTestVar')
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild<{ testVar: boolean }>>()
})

test('inputs interface types', () => {
  interface InputsInterface {
    testVar: string
  }

  const handler: OnPreBuild<InputsInterface> = (ctx) => {
    expectTypeOf(ctx.inputs.testVar).toEqualTypeOf<string>()
    expectTypeOf(ctx.inputs).not.toHaveProperty('otherTestVar')
  }

  expectTypeOf(handler).toEqualTypeOf<OnPreBuild<InputsInterface>>()
})
