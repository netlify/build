const { platform } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Bugs', async t => {
  await runFixture(t, 'top', { env: { NETLIFY_BUILD_TEST_UNCAUGHT: 'simple' } })
})

test('Bugs with error properties', async t => {
  await runFixture(t, 'top', { env: { NETLIFY_BUILD_TEST_UNCAUGHT: 'props' } })
})

test('Top-level errors', async t => {
  await runFixture(t, 'top')
})

test('Top function errors local', async t => {
  await runFixture(t, 'function')
})

test('Top function errors in module', async t => {
  await runFixture(t, 'function_module')
})

test('CI errors with all fields', async t => {
  await runFixture(t, 'ci_full', { env: { NETLIFY: 'true' } })
})

test('CI errors with partial fields', async t => {
  await runFixture(t, 'ci_partial', { env: { NETLIFY: 'true' } })
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
