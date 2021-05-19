const process = require('process')

const test = require('ava')

const { listFrameworks } = require('../src/main')

const { FIXTURES_DIR } = require('./helpers/main')

test.serial('projectDir option defaults to process.cwd()', async (t) => {
  const oldCwd = process.cwd()
  process.chdir(`${FIXTURES_DIR}/simple`)
  try {
    const frameworks = await listFrameworks({})
    t.is(frameworks.length, 1)
  } finally {
    process.chdir(oldCwd)
  }
})

test.serial('Can trigger with no options', async (t) => {
  const oldCwd = process.cwd()
  process.chdir(`${FIXTURES_DIR}/simple`)
  try {
    const frameworks = await listFrameworks()
    t.is(frameworks.length, 1)
  } finally {
    process.chdir(oldCwd)
  }
})
