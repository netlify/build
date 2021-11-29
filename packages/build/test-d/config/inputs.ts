import { OnPreBuild } from '@netlify/build'
import { expectAssignable, expectError, expectType } from 'tsd'

import { JSONValue } from '../../types/utils/json_value'

const testGenericInputs: OnPreBuild = function ({ inputs }) {
  expectAssignable<JSONValue | undefined>(inputs.testVar)
}

const testSpecificInputs: OnPreBuild<{ testVar: boolean }> = function ({ inputs }) {
  expectType<boolean>(inputs.testVar)
  expectError(inputs.otherTestVar)
}

interface InputsInterface {
  testVar: string
}

const testSpecificInputsInterface: OnPreBuild<InputsInterface> = function ({ inputs }) {
  expectType<string>(inputs.testVar)
  expectError(inputs.otherTestVar)
}
