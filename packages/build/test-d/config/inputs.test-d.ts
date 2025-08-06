import type { OnPreBuild } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'
import type { JSONValue } from '../../src/types/utils/json_value.js'

test('generic inputs types', () => {
  type GenericInputs = Parameters<OnPreBuild>[0]['inputs']
  expectTypeOf<GenericInputs['testVar']>().toExtend<JSONValue | undefined>()
})

test('specific inputs types', () => {
  type SpecificInputs = Parameters<OnPreBuild<{ testVar: boolean }>>[0]['inputs']
  expectTypeOf<SpecificInputs['testVar']>().toEqualTypeOf<boolean>()

  // @ts-expect-error - non-existent property
  expectTypeOf<SpecificInputs['otherTestVar']>().toBeNever()
})

test('specific inputs interface types', () => {
  interface InputsInterface {
    testVar: string
  }

  type InterfaceInputs = Parameters<OnPreBuild<InputsInterface>>[0]['inputs']
  expectTypeOf<InterfaceInputs['testVar']>().toEqualTypeOf<string>()

  // @ts-expect-error - non-existent property
  expectTypeOf<InterfaceInputs['otherTestVar']>().toBeNever()
})
