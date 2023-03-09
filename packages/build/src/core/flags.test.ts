import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { parseFlags } from './flags.js'

let originalArgv: string[]
beforeEach(() => {
  // Remove all cached modules. The cache needs to be cleared before running
  // each command, otherwise you will see the same results from the command
  // run in your first test in subsequent tests.
  vi.resetModules()
  originalArgv = process.argv
})

afterEach(() => {
  vi.resetAllMocks()
  // Set process arguments back to the original value
  process.argv = originalArgv
})

function testFlags(...args: string[]) {
  process.argv = ['netlify-build', ...args]
  return parseFlags()
}

test('should get the default values for the flags', () => {
  const flags = testFlags()
  expect(flags).toEqual({
    featureFlags: {},
    mode: 'require',
    quiet: false,
  })
})

test('should override the default value for mode', () => {
  const flags = testFlags('--quiet', 'true', '--dry')
  console.log(flags)
  expect(flags).toEqual({
    featureFlags: {},
    mode: 'require',
    quiet: true,
  })
})
