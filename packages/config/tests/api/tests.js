'use strict'

const test = require('ava')

const { runFixture, FIXTURES_DIR, startServer } = require('../helpers/main')

const SITE_INFO_PATH = '/api/v1/sites/test'
const SITE_INFO_DATA = { url: 'test', build_settings: { repo_url: 'test' } }
const SITE_INFO_ERROR = { error: 'invalid' }

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
const SITE_INFO_BASE_REL_DIR = {
  url: 'test',
  build_settings: { base_rel_dir: false },
}
const SITE_INFO_BUILD_SETTINGS_NULL = {
  url: 'test',
  build_settings: { cmd: null, dir: null, functions_dir: null, base: null, env: null, base_rel_dir: null },
}

const runWithMockServer = async function (t, fixtureName, { response, status, flags }) {
  const { scheme, host, stopServer } = await startServer({ path: SITE_INFO_PATH, response, status })
  try {
    await runFixture(t, fixtureName, { flags: { testOpts: { scheme, host }, ...flags } })
  } finally {
    await stopServer()
  }
}

test('--token', async (t) => {
  await runFixture(t, 'empty', { flags: { token: 'test', testOpts: { env: false } } })
})

test('--token in CLI', async (t) => {
  await runFixture(t, 'empty', { flags: { token: 'test', testOpts: { env: false } }, useBinary: true })
})

test('NETLIFY_AUTH_TOKEN environment variable', async (t) => {
  await runFixture(t, 'empty', { flags: { testOpts: { env: false } }, env: { NETLIFY_AUTH_TOKEN: 'test' } })
})

test('--site-id', async (t) => {
  await runFixture(t, 'empty', { flags: { siteId: 'test' } })
})

test('NETLIFY_SITE_ID environment variable', async (t) => {
  await runFixture(t, 'empty', { env: { NETLIFY_SITE_ID: 'test' } })
})

test('Environment variable siteInfo success', async (t) => {
  await runWithMockServer(t, 'empty', { response: SITE_INFO_DATA, flags: { token: 'test', siteId: 'test' } })
})

test('Environment variable siteInfo API error', async (t) => {
  await runWithMockServer(t, 'empty', {
    response: SITE_INFO_ERROR,
    status: 400,
    flags: { token: 'test', siteId: 'test' },
  })
})

test('Environment variable siteInfo no token', async (t) => {
  await runWithMockServer(t, 'empty', { response: SITE_INFO_DATA, flags: { siteId: 'test' } })
})

test('Environment variable siteInfo no siteId', async (t) => {
  await runWithMockServer(t, 'empty', { response: SITE_INFO_DATA, flags: { token: 'test' } })
})

test('Environment variable siteInfo offline', async (t) => {
  await runWithMockServer(t, 'empty', {
    response: SITE_INFO_DATA,
    flags: { siteId: 'test', token: 'test', offline: true },
  })
})

test('Environment variable siteInfo CI', async (t) => {
  await runWithMockServer(t, 'empty', {
    response: SITE_INFO_DATA,
    flags: { token: 'test', siteId: 'test', mode: 'buildbot' },
  })
})

test('Build settings can be null', async (t) => {
  await runWithMockServer(t, 'empty', {
    response: SITE_INFO_BUILD_SETTINGS_NULL,
    flags: { token: 'test', siteId: 'test' },
  })
})

test('Use build settings if a siteId and token are provided', async (t) => {
  await runWithMockServer(t, 'base', { response: SITE_INFO_BUILD_SETTINGS, flags: { token: 'test', siteId: 'test' } })
})

test('Build settings have low merging priority', async (t) => {
  await runWithMockServer(t, 'build_settings', {
    response: SITE_INFO_BUILD_SETTINGS,
    flags: { token: 'test', siteId: 'test', baseRelDir: true },
  })
})

test('Build settings are not used without a token', async (t) => {
  await runWithMockServer(t, 'base', { response: SITE_INFO_BUILD_SETTINGS, flags: { siteId: 'test' } })
})

test('Build settings are not used without a siteId', async (t) => {
  await runWithMockServer(t, 'base', { response: SITE_INFO_BUILD_SETTINGS, flags: { token: 'test' } })
})

test('Build settings are not used in CI', async (t) => {
  await runWithMockServer(t, 'base', {
    response: SITE_INFO_BUILD_SETTINGS,
    flags: { token: 'test', siteId: 'test', mode: 'buildbot' },
  })
})

test('baseRelDir is true if build.base is overridden', async (t) => {
  await runWithMockServer(t, 'build_base_override', {
    response: SITE_INFO_BASE_REL_DIR,
    flags: {
      cwd: `${FIXTURES_DIR}/build_base_override/subdir`,
      token: 'test',
      siteId: 'test',
    },
  })
})
