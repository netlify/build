const { platform } = require('process')

const test = require('ava')
const cpy = require('cpy')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')
const { createRepoDir, removeDir } = require('../../helpers/dir')

test('Top-level errors', async t => {
  await runFixture(t, 'top')
})

test('Top function errors local', async t => {
  await runFixture(t, 'function')
})

test('Node module all fields', async t => {
  await runFixture(t, 'full')
})

test('Node module partial fields', async t => {
  await runFixture(t, 'partial')
})

test('No repository root', async t => {
  const cwd = await createRepoDir({ git: false })
  try {
    await cpy(`${FIXTURES_DIR}/no_root/*`, cwd)
    await runFixture(t, 'no_root', { repositoryRoot: cwd })
  } finally {
    await removeDir(cwd)
  }
})

test('Process warnings', async t => {
  await runFixture(t, 'warning')
})

test('Uncaught exception', async t => {
  await runFixture(t, 'uncaught')
})

test('Unhandled promises', async t => {
  await runFixture(t, 'unhandled_promise')
})

test('Exits in plugins', async t => {
  await runFixture(t, 'plugin_exit')
})

// Process exit is different on Windows
if (platform !== 'win32') {
  test('Early exit', async t => {
    await runFixture(t, 'early_exit')
  })
}
