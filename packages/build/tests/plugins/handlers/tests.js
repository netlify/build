const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('plugin.onSuccess is triggered on success', async t => {
  await runFixture(t, 'success_ok')
})

test('plugin.onSuccess is not triggered on failure', async t => {
  await runFixture(t, 'success_not_ok')
})

test('plugin.onSuccess is not triggered on failPlugin()', async t => {
  await runFixture(t, 'success_fail_plugin')
})

test('plugin.onSuccess is not triggered on cancelBuild()', async t => {
  await runFixture(t, 'success_cancel_build')
})

test('plugin.onSuccess can fail', async t => {
  await runFixture(t, 'success_fail')
})

test('plugin.onError is not triggered on success', async t => {
  await runFixture(t, 'error_ok')
})

test('plugin.onError is triggered on failure', async t => {
  await runFixture(t, 'error_not_ok')
})

test('plugin.onError is triggered on failPlugin()', async t => {
  await runFixture(t, 'error_fail_plugin')
})

test('plugin.onError is triggered on cancelBuild()', async t => {
  await runFixture(t, 'error_cancel_build')
})

test('plugin.onError gets an error argument', async t => {
  await runFixture(t, 'error_argument')
})

test('plugin.onError can be used in several plugins', async t => {
  await runFixture(t, 'error_several')
})

test('plugin.onEnd is triggered on success', async t => {
  await runFixture(t, 'end_ok')
})

test('plugin.onEnd is triggered on failure', async t => {
  await runFixture(t, 'end_not_ok')
})

test('plugin.onEnd is triggered on failPlugin()', async t => {
  await runFixture(t, 'end_fail_plugin')
})

test('plugin.onEnd is triggered on cancelBuild()', async t => {
  await runFixture(t, 'end_cancel_build')
})

test('plugin.onEnd can fail', async t => {
  await runFixture(t, 'end_fail')
})

test('plugin.onEnd and plugin.onError can be used together', async t => {
  await runFixture(t, 'end_error')
})

test('plugin.onEnd and plugin.onError can fail', async t => {
  await runFixture(t, 'end_error_fail')
})

test('plugin.onEnd can be used in several plugins', async t => {
  await runFixture(t, 'end_several')
})
