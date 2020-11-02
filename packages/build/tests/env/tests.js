'use strict'

const { platform } = require('process')

const test = require('ava')

const { runFixture } = require('../helpers/main')
const { startServer } = require('../helpers/server')

test('Environment variable git', async (t) => {
  await runFixture(t, 'git')
})

test('Environment variable git with --branch', async (t) => {
  await runFixture(t, 'git_branch', { flags: { branch: 'test' } })
})

test('Environment variable git no repository', async (t) => {
  await runFixture(t, 'git', { copyRoot: { git: false } })
})

// Windows environment variables work differently
if (platform !== 'win32') {
  test('Environment variable in build.command', async (t) => {
    await runFixture(t, 'command')
  })
}

test('Environment variable GATSBY_TELEMETRY_DISABLED', async (t) => {
  await runFixture(t, 'gatsby_telemetry')
})

test('Environment variable NEXT_TELEMETRY_DISABLED', async (t) => {
  await runFixture(t, 'next_telemetry')
})

test('Environment variable NETLIFY local', async (t) => {
  await runFixture(t, 'netlify')
})

test('Environment variable NETLIFY CI', async (t) => {
  await runFixture(t, 'netlify', { flags: { mode: 'buildbot' }, env: { NETLIFY: 'true' } })
})

test('Environment variable LANG', async (t) => {
  await runFixture(t, 'lang')
})

test('Environment variable LANGUAGE', async (t) => {
  await runFixture(t, 'language')
})

test('Environment variable LC_ALL', async (t) => {
  await runFixture(t, 'lc_all')
})

test('Environment variable CONTEXT', async (t) => {
  await runFixture(t, 'context')
})

const SITE_INFO_PATH = '/api/v1/sites/test'
const SITE_INFO_DATA = { url: 'test', build_settings: { repo_url: 'test' } }

test('Environment variable siteInfo success', async (t) => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_DATA)
  await runFixture(t, 'site_info', { flags: { token: 'test', siteId: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('Environment variable siteInfo empty', async (t) => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, {})
  await runFixture(t, 'site_info', { flags: { token: 'test', siteId: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('Empty string environment variables', async (t) => {
  await runFixture(t, 'empty_string')
})

test('build.environment', async (t) => {
  await runFixture(t, 'build')
})

test('build.environment readonly', async (t) => {
  await runFixture(t, 'build_readonly')
})

const BUGSNAG_TEST_KEY = '00000000000000000000000000000000'
test('Does not pass BUGSNAG_KEY to build command and plugins', async (t) => {
  await runFixture(t, 'bugsnag_key', { env: { BUGSNAG_KEY: BUGSNAG_TEST_KEY } })
})
