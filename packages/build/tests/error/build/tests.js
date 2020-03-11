const test = require('ava')

const { runFixture } = require('../../helpers/main')
const { startServer } = require('../../helpers/server')

const CANCEL_PATH = '/api/v1/deploys/test/cancel'

test('build.fail()', async t => {
  await runFixture(t, 'fail')
})

test('build.fail() error option', async t => {
  await runFixture(t, 'fail_error_option')
})

test('build.cancel()', async t => {
  await runFixture(t, 'cancel')
})

test('build.cancel() error option', async t => {
  await runFixture(t, 'cancel_error_option')
})

test('build.cancel() API call', async t => {
  const { scheme, host, request, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', {
    flags: '--token=test',
    env: { DEPLOY_ID: 'test', TEST_SCHEME: scheme, TEST_HOST: host },
  })
  await stopServer()
  t.snapshot(request)
})

test('build.cancel() API call no DEPLOY_ID', async t => {
  const { scheme, host, request, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', { flags: '--token=test', env: { TEST_SCHEME: scheme, TEST_HOST: host } })
  await stopServer()
  t.false(request.sent)
})

test('build.cancel() API call no token', async t => {
  const { scheme, host, request, stopServer } = await startServer(CANCEL_PATH)
  await runFixture(t, 'cancel', {
    env: { DEPLOY_ID: 'test', TEST_SCHEME: scheme, TEST_HOST: host },
  })
  await stopServer()
  t.false(request.sent)
})

test('build.cancel() API call failure', async t => {
  await runFixture(t, 'cancel', {
    flags: '--token=test',
    env: { DEPLOY_ID: 'test', TEST_HOST: '...' },
  })
})

test('exception', async t => {
  await runFixture(t, 'exception')
})

test('exception with static properties', async t => {
  await runFixture(t, 'exception_props')
})
