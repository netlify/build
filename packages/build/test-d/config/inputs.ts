import type { OnPreBuild } from '@netlify/build'
import { expectAssignable, expectError, expectType } from 'tsd'
import type { JSONValue } from '../../lib/types/utils/json_value.js'

export const testGenericInputs: OnPreBuild = function ({ inputs }) {
  expectAssignable<JSONValue | undefined>(inputs.testVar)
}

export const testSpecificInputs: OnPreBuild<{ testVar: boolean }> = function ({ inputs }) {
  expectType<boolean>(inputs.testVar)
  expectError(inputs.otherTestVar)
}

interface InputsInterface {
  testVar: string
}

export const testSpecificInputsInterface: OnPreBuild<InputsInterface> = function ({ inputs }) {
  expectType<string>(inputs.testVar)
  expectError(inputs.otherTestVar)
}
