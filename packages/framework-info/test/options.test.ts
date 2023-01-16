import { cwd, chdir } from 'process'

import { expect, test } from 'vitest'

import { listFrameworks } from '../src/main.js'

import { FIXTURES_DIR } from './helpers/main.js'

test('projectDir option defaults to process.cwd()', async () => {
  const oldCwd = cwd()
  chdir(`${FIXTURES_DIR}/simple`)
  try {
    const frameworks = await listFrameworks({})
    expect(frameworks).toHaveLength(1)
  } finally {
    chdir(oldCwd)
  }
})

test('Can trigger with no options', async () => {
  const oldCwd = cwd()
  chdir(`${FIXTURES_DIR}/simple`)
  try {
    const frameworks = await listFrameworks()
    expect(frameworks).toHaveLength(1)
  } finally {
    chdir(oldCwd)
  }
})
