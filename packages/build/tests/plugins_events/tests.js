import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'
import sinon from 'sinon'

test('plugin.onSuccess is triggered on success', async (t) => {
  const output = await new Fixture('./fixtures/success_ok').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onSuccess is not triggered on failure', async (t) => {
  const output = await new Fixture('./fixtures/success_not_ok').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onSuccess is not triggered on failPlugin()', async (t) => {
  const output = await new Fixture('./fixtures/success_fail_plugin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onSuccess is not triggered on cancelBuild()', async (t) => {
  const output = await new Fixture('./fixtures/success_cancel_build').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onSuccess can fail but does not stop builds', async (t) => {
  const output = await new Fixture('./fixtures/success_fail').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onError is not triggered on success', async (t) => {
  const output = await new Fixture('./fixtures/error_ok').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onError is triggered on failure', async (t) => {
  const output = await new Fixture('./fixtures/error_not_ok').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onError is not triggered on failPlugin()', async (t) => {
  const output = await new Fixture('./fixtures/error_fail_plugin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onError is triggered on cancelBuild()', async (t) => {
  const output = await new Fixture('./fixtures/error_cancel_build').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onError can fail', async (t) => {
  const output = await new Fixture('./fixtures/error_fail').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onError gets an error argument', async (t) => {
  const output = await new Fixture('./fixtures/error_argument').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onError can be used in several plugins', async (t) => {
  const output = await new Fixture('./fixtures/error_several').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onEnd is triggered on success', async (t) => {
  const output = await new Fixture('./fixtures/end_ok').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onEnd is triggered on failure', async (t) => {
  const output = await new Fixture('./fixtures/end_not_ok').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onEnd is not triggered on failPlugin()', async (t) => {
  const output = await new Fixture('./fixtures/end_fail_plugin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onEnd is triggered on cancelBuild()', async (t) => {
  const output = await new Fixture('./fixtures/end_cancel_build').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onEnd can fail but it does not stop builds', async (t) => {
  const output = await new Fixture('./fixtures/end_fail').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onEnd and plugin.onError can be used together', async (t) => {
  const output = await new Fixture('./fixtures/end_error').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('plugin.onEnd can be used in several plugins', async (t) => {
  const output = await new Fixture('./fixtures/end_several').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Does not run `*Dev` events on the build timeline', async (t) => {
  const output = await new Fixture('./fixtures/dev_and_build').withFlags({ debug: false }).runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('Runs the `*Dev` events and not the `*Build` events on the dev timeline', async (t) => {
  const devCommand = sinon.stub().resolves()

  const output = await new Fixture('./fixtures/dev_and_build')
    .withFlags({ debug: false, timeline: 'dev' })
    .runDev(devCommand)
  t.snapshot(normalizeOutput(output))

  t.is(devCommand.callCount, 1)
})
