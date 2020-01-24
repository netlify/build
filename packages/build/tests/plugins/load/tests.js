const { platform } = require('process')

const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Local plugins', async t => {
  await runFixture(t, 'local')
})

test('Node module plugins', async t => {
  await runFixture(t, 'module')
})

test('Missing plugins', async t => {
  await runFixture(t, 'missing')
})

test('Install missing plugins', async t => {
  await del(`${FIXTURES_DIR}/instal_missing/node_modules`, { force: true })
  await runFixture(t, 'install_missing')
  await del(`${FIXTURES_DIR}/instal_missing/node_modules`, { force: true })
})

test('Plugin.id is optional', async t => {
  await runFixture(t, 'optional_id')
})

test('Plugin.enabled', async t => {
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
