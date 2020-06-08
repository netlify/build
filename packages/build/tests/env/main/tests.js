const { platform } = require('process')

const test = require('ava')
const isCI = require('is-ci')

const { runFixture } = require('../../helpers/main')
const { startServer } = require('../../helpers/server')

// Windows environment variables work differently
if (platform !== 'win32') {
  test('Environment variable in build.command', async t => {
    await runFixture(t, 'command')
  })
}

test('Environment variable GATSBY_TELEMETRY_DISABLED', async t => {
  await runFixture(t, 'gatsby_telemetry')
})

test('Environment variable NEXT_TELEMETRY_DISABLED', async t => {
  await runFixture(t, 'next_telemetry')
})

test('Environment variable NETLIFY local', async t => {
  await runFixture(t, 'netlify')
})

// TODO: figure out why those tests randomly fail on Linux
if (platform !== 'linux' || !isCI) {
  test('Environment variable NETLIFY CI', async t => {
    await runFixture(t, 'netlify', { flags: { mode: 'buildbot' }, env: { NETLIFY: 'true' } })
  })
}

test('Environment variable LANG', async t => {
  await runFixture(t, 'lang')
})

test('Environment variable LANGUAGE', async t => {
  await runFixture(t, 'language')
})

test('Environment variable LC_ALL', async t => {
  await runFixture(t, 'lc_all')
})

test('Environment variable CONTEXT', async t => {
  await runFixture(t, 'context')
})

const SITE_INFO_PATH = '/api/v1/sites/test'
const SITE_INFO_DATA = { url: 'test', build_settings: { repo_url: 'test' } }

test('Environment variable siteInfo success', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_DATA)
  await runFixture(t, 'site_info', { flags: { token: 'test', siteId: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('build.environment', async t => {
  await runFixture(t, 'build')
})

test('build.environment readonly', async t => {
  await runFixture(t, 'build_readonly')
})
