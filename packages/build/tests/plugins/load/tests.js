const { platform } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Local plugins', async t => {
  await runFixture(t, 'local')
})

test('Node module plugins', async t => {
  await runFixture(t, 'module')
})

test('Missing plugins', async t => {
  await runFixture(t, 'missing')
})

test('Plugin.id is optional', async t => {
  await runFixture(t, 'optional_id')
})

test.only('Plugin.enabled', async t => {
  await runFixture(t, 'enabled')
})

test('Override plugins', async t => {
  await runFixture(t, 'override')
})

test('Top-level errors', async t => {
  await runFixture(t, 'error_top')
})

test('Top function errors', async t => {
  await runFixture(t, 'error_function')
})

test('Process warnings', async t => {
  await runFixture(t, 'error_warning')
})

test('Unhandled promises', async t => {
  await runFixture(t, 'error_promise')
})

// Process exit is different on Windows
if (platform !== 'win32') {
  test('Early exit', async t => {
    await runFixture(t, 'early_exit')
  })
}
