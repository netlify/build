const test = require('ava')

const { runFixture } = require('../../helpers/main')
const { runWithApiMock } = require('../helpers/run')

test('utils.status.show() are printed locally', async t => {
  await runFixture(t, 'print')
})

test('utils.status.show() are not printed in production', async t => {
  await runFixture(t, 'print', { flags: { mode: 'buildbot' } })
})

test('utils.status.show() statuses are sent to the API', async t => {
  await runWithApiMock(t, 'print')
})

test('utils.status.show() statuses are not sent to the API without a token', async t => {
  await runWithApiMock(t, 'print', { flags: { token: '' } })
})

test('utils.status.show() statuses are not sent to the API without a DEPLOY_ID', async t => {
  await runWithApiMock(t, 'print', { flags: { deployId: '' } })
})

test('utils.status.show() statuses API errors are handled', async t => {
  await runWithApiMock(t, 'simple', { status: 502 })
})

test('utils.status.show() statuses are sent to the API without colors', async t => {
  await runWithApiMock(t, 'colors')
})

test('report error statuses from failBuild()', async t => {
  await runWithApiMock(t, 'error_fail_build')
})

test('report error statuses from failPlugin()', async t => {
  await runWithApiMock(t, 'error_fail_plugin')
})

test('report error statuses from cancelBuild()', async t => {
  await runWithApiMock(t, 'error_cancel_build')
})

test('does not report error statuses from build.command errors', async t => {
  await runWithApiMock(t, 'error_build_command')
})

test('report error statuses from uncaught exceptions with static properties', async t => {
  await runWithApiMock(t, 'error_properties')
})

test('report error statuses from uncaught exceptions during plugin load', async t => {
  await runWithApiMock(t, 'error_load_uncaught')
})

test('report error statuses from plugin invalid shape', async t => {
  await runWithApiMock(t, 'error_plugin_shape')
})

test('report error statuses from plugin inputs validation', async t => {
  await runWithApiMock(t, 'error_inputs_validation')
})
