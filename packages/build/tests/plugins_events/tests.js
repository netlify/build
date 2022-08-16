import test from 'ava'
import sinon from 'sinon'

import { runFixture } from '../helpers/main.js'

test('plugin.onSuccess is triggered on success', async (t) => {
  await runFixture(t, 'success_ok')
})

test('plugin.onSuccess is not triggered on failure', async (t) => {
  await runFixture(t, 'success_not_ok')
})

test('plugin.onSuccess is not triggered on failPlugin()', async (t) => {
  await runFixture(t, 'success_fail_plugin')
})

test('plugin.onSuccess is not triggered on cancelBuild()', async (t) => {
  await runFixture(t, 'success_cancel_build')
})

test('plugin.onSuccess can fail but does not stop builds', async (t) => {
  await runFixture(t, 'success_fail')
})

test('plugin.onError is not triggered on success', async (t) => {
  await runFixture(t, 'error_ok')
})

test('plugin.onError is triggered on failure', async (t) => {
  await runFixture(t, 'error_not_ok')
})

test('plugin.onError is not triggered on failPlugin()', async (t) => {
  await runFixture(t, 'error_fail_plugin')
})

test('plugin.onError is triggered on cancelBuild()', async (t) => {
  await runFixture(t, 'error_cancel_build')
})

test('plugin.onError can fail', async (t) => {
  await runFixture(t, 'error_fail')
})

test('plugin.onError gets an error argument', async (t) => {
  await runFixture(t, 'error_argument')
})

test('plugin.onError can be used in several plugins', async (t) => {
  await runFixture(t, 'error_several')
})

test('plugin.onEnd is triggered on success', async (t) => {
  await runFixture(t, 'end_ok')
})

test('plugin.onEnd is triggered on failure', async (t) => {
  await runFixture(t, 'end_not_ok')
})

test('plugin.onEnd is not triggered on failPlugin()', async (t) => {
  await runFixture(t, 'end_fail_plugin')
})

test('plugin.onEnd is triggered on cancelBuild()', async (t) => {
  await runFixture(t, 'end_cancel_build')
})

test('plugin.onEnd can fail but it does not stop builds', async (t) => {
  await runFixture(t, 'end_fail')
})

test('plugin.onEnd and plugin.onError can be used together', async (t) => {
  await runFixture(t, 'end_error')
})

test('plugin.onEnd can be used in several plugins', async (t) => {
  await runFixture(t, 'end_several')
})

test('Does not run `*Dev` events on the build timeline', async (t) => {
  await runFixture(t, 'dev_and_build')
})

test('Runs the `*Dev` events and not the `*Build` events on the dev timeline', async (t) => {
  const devCommand = sinon.stub().resolves()

  await runFixture(t, 'dev_and_build', {
    flags: { timeline: 'dev' },
    devCommand,
  })

  t.is(devCommand.callCount, 1)
})
