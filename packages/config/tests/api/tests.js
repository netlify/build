const test = require('ava')

const { runFixture, startServer } = require('../helpers/main')

test('--token', async t => {
  await runFixture(t, 'empty', { flags: '--token=test' })
})

test('NETLIFY_AUTH_TOKEN environment variable', async t => {
  await runFixture(t, 'empty', { env: { NETLIFY_AUTH_TOKEN: 'test' } })
})

test('--site-id', async t => {
  await runFixture(t, 'empty', { flags: '--site-id=test' })
})

const SITE_INFO_PATH = '/api/v1/sites/test'
const SITE_INFO_DATA = { url: 'test', build_settings: { repo_url: 'test' } }
const SITE_INFO_ERROR = { error: 'invalid' }

test('Environment variable siteInfo success', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_DATA)
  await runFixture(t, 'empty', {
    flags: '--token=test --site-id=test',
    env: { TEST_SCHEME: scheme, TEST_HOST: host },
  })
  await stopServer()
})

test('Environment variable siteInfo API error', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_ERROR, { status: 400 })
  await runFixture(t, 'empty', {
    flags: '--token=test --site-id=test',
    env: { TEST_SCHEME: scheme, TEST_HOST: host },
  })
  await stopServer()
})

test('Environment variable siteInfo no token', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_DATA)
  await runFixture(t, 'empty', {
    flags: '--site-id=test',
    env: { TEST_SCHEME: scheme, TEST_HOST: host },
  })
  await stopServer()
})

test('Environment variable siteInfo no siteId', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_DATA)
  await runFixture(t, 'empty', {
    flags: '--token=test',
    env: { TEST_SCHEME: scheme, TEST_HOST: host },
  })
  await stopServer()
})

test('Environment variable siteInfo CI', async t => {
  const { scheme, host, stopServer } = await startServer(SITE_INFO_PATH, SITE_INFO_DATA)
  await runFixture(t, 'empty', {
    flags: '--token=test --site-id=test',
    env: { TEST_SCHEME: scheme, TEST_HOST: host, NETLIFY: 'true' },
  })
  await stopServer()
})
