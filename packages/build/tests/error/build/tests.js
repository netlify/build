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

test('build.fail() backward compatibility', async t => {
  await runFixture(t, 'fail_build_compat')
})

test('build.failPlugin()', async t => {
  await runFixture(t, 'fail_plugin')
})

test('build.failPlugin() error option', async t => {
  await runFixture(t, 'fail_plugin_error_option')
})

test('build.cancelBuild()', async t => {
  await runFixture(t, 'cancel')
})

test('build.cancelBuild() error option', async t => {
  await runFixture(t, 'cancel_error_option')
})

test('build.cancel() backward compatibility', async t => {
  await runFixture(t, 'cancel_compat')
})

test('build.cancelBuild() API call', async t => {
  const { scheme, host, request, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', {
    flags: '--token=test',
    env: { DEPLOY_ID: 'test', TEST_SCHEME: scheme, TEST_HOST: host },
  })
  await stopServer()
  t.snapshot(request)
})

test('build.cancelBuild() API call no DEPLOY_ID', async t => {
  const { scheme, host, request, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', { flags: '--token=test', env: { TEST_SCHEME: scheme, TEST_HOST: host } })
  await stopServer()
  t.false(request.sent)
})

test('build.cancelBuild() API call no token', async t => {
  const { scheme, host, request, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', {
    env: { DEPLOY_ID: 'test', TEST_SCHEME: scheme, TEST_HOST: host },
  })
  await stopServer()
  t.false(request.sent)
})

// Node 10 `util.inspect()` output is different from Node 8, leading to
// inconsistent test snapshots
if (!version.startsWith('v8.')) {
  test('build.cancelBuild() API call failure', async t => {
    await runFixture(t, 'cancel', {
      flags: '--token=test',
      env: { DEPLOY_ID: 'test', TEST_HOST: '...' },
    })
  })
}

test('exception', async t => {
  await runFixture(t, 'exception')
})

test('exception with static properties', async t => {
  await runFixture(t, 'exception_props')
})
