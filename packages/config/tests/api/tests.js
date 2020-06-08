const test = require('ava')

const { runFixture, startServer } = require('../helpers/main')

test('--token', async t => {
  await runFixture(t, 'empty', { flags: { token: 'test' } })
})

test('NETLIFY_AUTH_TOKEN environment variable', async t => {
  await runFixture(t, 'empty', { env: { NETLIFY_AUTH_TOKEN: 'test' } })
})

test('--site-id', async t => {
  await runFixture(t, 'empty', { flags: { siteId: 'test' } })
})

const SITE_INFO_PATH = '/api/v1/sites/test'
const SITE_INFO_DATA = { url: 'test', build_settings: { repo_url: 'test' } }
const SITE_INFO_ERROR = { error: 'invalid' }

test('Environment variable siteInfo success', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_DATA)
  await runFixture(t, 'empty', { flags: { token: 'test', siteId: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('Environment variable siteInfo API error', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_ERROR, { status: 400 })
  await runFixture(t, 'empty', { flags: { token: 'test', siteId: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('Environment variable siteInfo no token', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_DATA)
  await runFixture(t, 'empty', { flags: { siteId: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('Environment variable siteInfo no siteId', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_DATA)
  await runFixture(t, 'empty', { flags: { token: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('Environment variable siteInfo CI', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_DATA)
  await runFixture(t, 'empty', {
    flags: { token: 'test', siteId: 'test', mode: 'buildbot', testOpts: { scheme, host } },
  })
  await stopServer()
})

const SITE_INFO_BUILD_SETTINGS_NULL = {
  url: 'test',
  build_settings: { cmd: null, dir: null, functions_dir: null, base: null, env: null, base_rel_dir: null },
}

test('Build settings can be null', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_BUILD_SETTINGS_NULL)
  await runFixture(t, 'empty', { flags: { token: 'test', siteId: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

const SITE_INFO_BUILD_SETTINGS = {
  url: 'test',
  build_settings: {
    cmd: 'testCommand',
    dir: 'testPublish',
    functions_dir: 'testFunctions',
    base: 'base',
    env: { TEST_ENV: 'test' },
    base_rel_dir: false,
  },
  plugins: [{ package: 'netlify-plugin-test', version: '1.0.0', inputs: { test: true } }],
}

test('Use build settings if a siteId and token are provided', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_BUILD_SETTINGS)
  await runFixture(t, 'base', { flags: { token: 'test', siteId: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('Build settings have low merging priority', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_BUILD_SETTINGS)
  await runFixture(t, 'build_settings', {
    flags: { token: 'test', siteId: 'test', baseRelDir: true, testOpts: { scheme, host } },
  })
  await stopServer()
})

test('Build settings are not used if getSite call fails', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_BUILD_SETTINGS, { status: 400 })
  await runFixture(t, 'base', { flags: { token: 'test', siteId: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('Build settings are not used without a token', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_BUILD_SETTINGS)
  await runFixture(t, 'base', { flags: { siteId: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('Build settings are not used without a siteId', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_BUILD_SETTINGS)
  await runFixture(t, 'base', { flags: { token: 'test', testOpts: { scheme, host } } })
  await stopServer()
})

test('Build settings are not used in CI', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_BUILD_SETTINGS)
  await runFixture(t, 'base', {
    flags: { token: 'test', siteId: 'test', mode: 'buildbot', testOpts: { scheme, host } },
  })
  await stopServer()
})
