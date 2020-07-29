const process = require('process')

const test = require('ava')

const { listFrameworks } = require('../src/main.js')

const { getFrameworks, FIXTURES_DIR } = require('./helpers/main.js')

test('Should detect frameworks', async t => {
  const frameworks = await getFrameworks('simple')
  t.snapshot(frameworks)
})

test('Should return an empty array when no framework is detected', async t => {
  const frameworks = await getFrameworks('empty')
  t.is(frameworks.length, 0)
})

test('Should return several items when multiple frameworks are detected', async t => {
  const frameworks = await getFrameworks('multiple')
  t.is(frameworks.length, 2)
})

test.serial('projectDir option defaults to process.cwd()', async t => {
  const oldCwd = process.cwd()
  process.chdir(`${FIXTURES_DIR}/simple`)
  try {
    const frameworks = await listFrameworks({})
    t.is(frameworks.length, 1)
  } finally {
    process.chdir(oldCwd)
  }
})

test.serial('Cannot trigger with no options', async t => {
  const oldCwd = process.cwd()
  process.chdir(`${FIXTURES_DIR}/simple`)
  try {
    const frameworks = await listFrameworks()
    t.is(frameworks.length, 1)
  } finally {
    process.chdir(oldCwd)
  }
})
