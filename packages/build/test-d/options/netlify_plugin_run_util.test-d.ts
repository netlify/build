import type { NetlifyPluginUtils } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'

test('utils run types', () => {
  type RunFunction = NetlifyPluginUtils['run']

  type RunResult = ReturnType<RunFunction>
  expectTypeOf<RunResult>().toExtend<Promise<object>>()

  expectTypeOf<RunFunction>().toBeCallableWith('command')
  expectTypeOf<RunFunction>().toBeCallableWith('command', ['arg'])
  expectTypeOf<RunFunction>().toBeCallableWith('command', ['arg'], { preferLocal: false })

  type RunCommand = NetlifyPluginUtils['run']['command']
  expectTypeOf<RunCommand>().toBeCallableWith('command')
})

test('utils run invalid options', () => {
  type RunFunction = NetlifyPluginUtils['run']

  // @ts-expect-error - testing invalid
  expectTypeOf<RunFunction>().toBeCallableWith('command', ['arg'], { unknownOption: false })
})
