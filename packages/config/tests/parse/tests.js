'use strict'

const { platform } = require('process')

const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../helpers/main')

test('Configuration file - netlify.toml', async (t) => {
  await runFixture(t, 'toml')
})

// Windows directory permissions work differently than Unix.
if (platform !== 'win32') {
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

test('Redirects - does not use redirects file when using inlineConfig with identical redirects', async (t) => {
  await runFixture(t, 'redirects_file', { flags: { inlineConfig: { redirects: [{ from: '/from', to: '/to' }] } } })
})

test('Headers - file', async (t) => {
  await runFixture(t, 'headers_file')
})

test('Headers - field', async (t) => {
  await runFixture(t, 'headers_field')
})

test('Headers - file and field', async (t) => {
  await runFixture(t, 'headers_both')
})

test('Headers - file syntax error', async (t) => {
  await runFixture(t, 'headers_file_error')
})

test('Headers - field syntax error', async (t) => {
  await runFixture(t, 'headers_field_error')
})

test('Headers - no publish field', async (t) => {
  await runFixture(t, 'headers_no_publish')
})

test('Headers - add headersOrigin', async (t) => {
  await runFixture(t, 'empty', { flags: { defaultConfig: { headers: [] } } })
})

test('Headers - log headersOrigin in debug mode', async (t) => {
  await runFixture(t, 'empty', { flags: { defaultConfig: { headers: [] }, debug: true } })
})

test('Headers - does not use headers file when using inlineConfig with identical headers', async (t) => {
  await runFixture(t, 'headers_file', {
    flags: { inlineConfig: { headers: [{ for: '/path', values: { test: 'one' } }] } },
  })
})
