'use strict'

const { platform, version } = require('process')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../helpers/main')

test('Configuration file - netlify.toml', async (t) => {
  await runFixture(t, 'toml')
})

// Windows directory permissions work differently than Unix.
// Node 10 also changed errors there, so Node 8 shows different error messages.
// TODO: remove once dropping support for Node 8
if (platform !== 'win32' && !version.startsWith('v8.')) {
  test('Configuration file - read permission error', async (t) => {
    await runFixture(t, '', { flags: { config: `${FIXTURES_DIR}/read_error/netlify.toml` } })
  })
}

test('Configuration file - parsing error', async (t) => {
  await runFixture(t, 'parse_error')
})

test('Redirects - redirects file', async (t) => {
  await runFixture(t, 'redirects_file')
})

test('Redirects - redirects field', async (t) => {
  await runFixture(t, 'redirects_field')
})

test('Redirects - redirects file and redirects field', async (t) => {
  await runFixture(t, 'redirects_both')
})

test('Redirects - redirects file syntax error', async (t) => {
  await runFixture(t, 'redirects_file_error')
})

test('Redirects - redirects field syntax error', async (t) => {
  await runFixture(t, 'redirects_field_error')
})

test('Redirects - no publish field', async (t) => {
  await runFixture(t, 'redirects_no_publish')
})

test('Redirects - add redirectsOrigin', async (t) => {
  await runFixture(t, 'empty', { flags: { defaultConfig: { redirects: [] } } })
})

test('Redirects - log redirectsOrigin in debug mode', async (t) => {
  await runFixture(t, 'empty', { flags: { defaultConfig: { redirects: [] }, debug: true } })
})

test('Redirects - does not use redirects file when using inlineConfig', async (t) => {
  await runFixture(t, 'redirects_file', { flags: { inlineConfig: { redirects: [] } } })
})

test('Redirects - does not use redirects file when using priorityConfig', async (t) => {
  await runFixture(t, 'redirects_file', { flags: { priorityConfig: { redirects: [] } } })
})
