import { NetlifyPlugin } from '@netlify/build'
import { expectAssignable, expectType, expectError } from 'tsd'

import { JSONValue } from '../../types/utils/json_value'
import { onPreBuild } from '../netlify_plugin'

const testGenericInputs: onPreBuild = function ({ inputs }) {
  expectAssignable<JSONValue | undefined>(inputs.testVar)
}

const testSpecificInputs: NetlifyPlugin<{ testVar: boolean }>['onPreBuild'] = function ({ inputs }) {
  expectType<boolean>(inputs.testVar)
  expectError(inputs.otherTestVar)
}
