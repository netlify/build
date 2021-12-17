import { platform } from 'process'

import test from 'ava'

import { runFixture } from '../helpers/main.js'

test('Environment variables are set in plugins', async (t) => {
  await runFixture(t, 'plugin')
})

// Windows environment variables work differently
if (platform !== 'win32') {
  test('Environment variable in build.command', async (t) => {
    await runFixture(t, 'command')
  })
}

test('build.environment are set in plugins', async (t) => {
  await runFixture(t, 'build')
})

const BUGSNAG_TEST_KEY = '00000000000000000000000000000000'
test('Does not pass BUGSNAG_KEY to build command and plugins', async (t) => {
  await runFixture(t, 'bugsnag_key', { env: { BUGSNAG_KEY: BUGSNAG_TEST_KEY } })
})

test('BRANCH environment variables is set with --branch', async (t) => {
  await runFixture(t, 'branch', { flags: { branch: 'test' } })
})

test('DEPLOY_ID environment variables is set with --deploy-id', async (t) => {
  await runFixture(t, 'deploy_id', { flags: { deployId: 'test' } })
})

test('BUILD_ID environment variables is set with --build-id', async (t) => {
  await runFixture(t, 'build_id', { flags: { buildId: 'test-build' } })
})

test('CONTEXT environment variables is set with --context', async (t) => {
  await runFixture(t, 'context', { flags: { context: 'test' } })
})
