const { version } = require('process')

const test = require('ava')

const { runFixture } = require('../../helpers/main')
const { startServer } = require('../../helpers/server')

const CANCEL_PATH = '/api/v1/deploys/test/cancel'

test('build.failBuild()', async t => {
  await runFixture(t, 'fail_build')
})

test('build.failBuild() error option', async t => {
  await runFixture(t, 'fail_build_error_option')
})

test('build.failBuild() inside a callback', async t => {
  await runFixture(t, 'fail_build_callback')
})

test('build.failPlugin()', async t => {
  await runFixture(t, 'fail_plugin')
})

test('build.failPlugin() inside a callback', async t => {
  await runFixture(t, 'fail_plugin_callback')
})

test('build.failPlugin() error option', async t => {
  await runFixture(t, 'fail_plugin_error_option')
})

test('build.cancelBuild()', async t => {
  await runFixture(t, 'cancel')
})

test('build.cancelBuild() inside a callback', async t => {
  await runFixture(t, 'cancel_callback')
})

test('build.cancelBuild() error option', async t => {
  await runFixture(t, 'cancel_error_option')
})

test('build.cancelBuild() API call', async t => {
  const { scheme, host, requests, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', {
    flags: `--token=test --deploy-id=test --testOpts.scheme=${scheme} --testOpts.host=${host}`,
  })
  await stopServer()
  t.snapshot(requests)
})

test('build.cancelBuild() API call no DEPLOY_ID', async t => {
  const { scheme, host, requests, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', { flags: `--token=test --testOpts.scheme=${scheme} --testOpts.host=${host}` })
  await stopServer()
  t.is(requests.length, 0)
})

test('build.cancelBuild() API call no token', async t => {
  const { scheme, host, requests, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', { flags: `--deploy-id=test --testOpts.scheme=${scheme} --testOpts.host=${host}` })
  await stopServer()
  t.is(requests.length, 0)
})

// Node 10 `util.inspect()` output is different from Node 8, leading to
// inconsistent test snapshots
if (!version.startsWith('v8.')) {
  test('build.cancelBuild() API call failure', async t => {
    await runFixture(t, 'cancel', { flags: `--token=test --deploy-id=test --testOpts.host=...` })
  })
}

test('exception', async t => {
  await runFixture(t, 'exception')
})

test('exception with static properties', async t => {
  await runFixture(t, 'exception_props')
})

test('exception with circular references', async t => {
  await runFixture(t, 'exception_circular')
})
