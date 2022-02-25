import test from 'ava'

import { runFixture } from '../helpers/main.js'
import { startServer } from '../helpers/server.js'

const CANCEL_PATH = '/api/v1/deploys/test/cancel'

test('build.failBuild()', async (t) => {
  await runFixture(t, 'fail_build')
})

test('build.failBuild() error option', async (t) => {
  await runFixture(t, 'fail_build_error_option')
})

test('build.failBuild() inside a callback', async (t) => {
  await runFixture(t, 'fail_build_callback')
})

test('build.failBuild() is not available within post-deploy events', async (t) => {
  await runFixture(t, 'fail_build_post_deploy')
})

test('build.failPlugin()', async (t) => {
  await runFixture(t, 'fail_plugin')
})

test('build.failPlugin() inside a callback', async (t) => {
  await runFixture(t, 'fail_plugin_callback')
})

test('build.failPlugin() error option', async (t) => {
  await runFixture(t, 'fail_plugin_error_option')
})

test('build.cancelBuild()', async (t) => {
  await runFixture(t, 'cancel')
})

test('build.cancelBuild() inside a callback', async (t) => {
  await runFixture(t, 'cancel_callback')
})

test('build.cancelBuild() error option', async (t) => {
  await runFixture(t, 'cancel_error_option')
})

const runWithApiMock = async function (t, flags) {
  const { scheme, host, requests, stopServer } = await startServer({ path: CANCEL_PATH })
  try {
    await runFixture(t, 'cancel', { flags: { testOpts: { scheme, host }, ...flags } })
  } finally {
    await stopServer()
  }
  return requests
}

test('build.cancelBuild() API call', async (t) => {
  const requests = await runWithApiMock(t, { token: 'test', deployId: 'test' })
  t.snapshot(requests)
})

test('build.cancelBuild() API call no DEPLOY_ID', async (t) => {
  const requests = await runWithApiMock(t, { token: 'test' })
  t.is(requests.length, 0)
})

test('build.cancelBuild() API call no token', async (t) => {
  const requests = await runWithApiMock(t, { deployId: 'test' })
  t.is(requests.length, 0)
})

test('build.cancelBuild() API call failure', async (t) => {
  await runFixture(t, 'cancel', {
    flags: { token: 'test', deployId: 'test', testOpts: { host: '...', env: false } },
  })
})

test('build.cancelBuild() is not available within post-deploy events', async (t) => {
  await runFixture(t, 'cancel_post_deploy')
})
