import { cwd, chdir } from 'process'

import test from 'ava'

import { listFrameworks } from '../src/main.js'

import { FIXTURES_DIR } from './helpers/main.js'

test.serial('projectDir option defaults to process.cwd()', async (t) => {
  const oldCwd = cwd()
  chdir(`${FIXTURES_DIR}/simple`)
  try {
    const frameworks = await listFrameworks({})
    t.is(frameworks.length, 1)
  } finally {
    chdir(oldCwd)
  }
})

test.serial('Can trigger with no options', async (t) => {
  const oldCwd = cwd()
  chdir(`${FIXTURES_DIR}/simple`)
  try {
    const frameworks = await listFrameworks()
    t.is(frameworks.length, 1)
  } finally {
    chdir(oldCwd)
  }
})
