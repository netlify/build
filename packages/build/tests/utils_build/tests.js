import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

const CANCEL_PATH = '/api/v1/deploys/test/cancel'

test('build.failBuild()', async (t) => {
  const output = await new Fixture('./fixtures/fail_build').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.failBuild() error option', async (t) => {
  const output = await new Fixture('./fixtures/fail_build_error_option').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.failBuild() inside a callback', async (t) => {
  const output = await new Fixture('./fixtures/fail_build_callback').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.failBuild() is not available within post-deploy events', async (t) => {
  const output = await new Fixture('./fixtures/fail_build_post_deploy').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.failPlugin()', async (t) => {
  const output = await new Fixture('./fixtures/fail_plugin').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.failPlugin() inside a callback', async (t) => {
  const output = await new Fixture('./fixtures/fail_plugin_callback').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.failPlugin() error option', async (t) => {
  const output = await new Fixture('./fixtures/fail_plugin_error_option').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.cancelBuild()', async (t) => {
  const output = await new Fixture('./fixtures/cancel').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.cancelBuild() inside a callback', async (t) => {
  const output = await new Fixture('./fixtures/cancel_callback').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.cancelBuild() error option', async (t) => {
  const output = await new Fixture('./fixtures/cancel_error_option').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.cancelBuild() API call', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/cancel')
    .withFlags({ token: 'test', deployId: 'test' })
    .runBuildServer({ path: CANCEL_PATH })
  t.snapshot(normalizeOutput(output))
  t.snapshot(requests)
})

test('build.cancelBuild() API call no DEPLOY_ID', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/cancel')
    .withFlags({ token: 'test' })
    .runBuildServer({ path: CANCEL_PATH })
  t.snapshot(normalizeOutput(output))
  t.is(requests.length, 0)
})

test('build.cancelBuild() API call no token', async (t) => {
  const { requests, output } = await new Fixture('./fixtures/cancel')
    .withFlags({ deployId: 'test' })
    .runBuildServer({ path: CANCEL_PATH })
  t.snapshot(normalizeOutput(output))
  t.is(requests.length, 0)
})

test('build.cancelBuild() API call failure', async (t) => {
  const output = await new Fixture('./fixtures/cancel')
    .withFlags({ token: 'test', deployId: 'test', testOpts: { host: '...', env: true } })
    .runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('build.cancelBuild() is not available within post-deploy events', async (t) => {
  const output = await new Fixture('./fixtures/cancel_post_deploy').runWithBuild()
  t.snapshot(normalizeOutput(output))
})
