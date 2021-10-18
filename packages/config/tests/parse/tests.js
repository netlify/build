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

test('Configuration file - valid backslash sequences in TOML should not fail', async (t) => {
  const { returnValue } = await runFixture(t, 'parse_backslash_valid')
  t.true(returnValue.includes('\\\\[this\\\\]\\ntest \\" \\b \\t \\n \\f \\r \\u0000 \\u0000'))
})

test('Configuration file - invalid backslash sequences in double quote strings in TOML should fail', async (t) => {
  await runFixture(t, 'parse_backslash_double')
})

test('Configuration file - trailing backslashes in double quote strings in TOML should fail', async (t) => {
  await runFixture(t, 'parse_backslash_trailing_double')
})

test('Configuration file - invalid backslash sequences in multiline double quote strings in TOML should fail', async (t) => {
  await runFixture(t, 'parse_backslash_double_multiline')
})

test('Configuration file - trailing backslashes in multiline double quotes strings in TOML should not fail', async (t) => {
  await runFixture(t, 'parse_backslash_trailing_double_multiline')
})

test('Configuration file - invalid backslash sequences in single quote strings in TOML should not fail', async (t) => {
  await runFixture(t, 'parse_backslash_single')
})

test('Configuration file - invalid backslash sequences in multiline single quote strings in TOML should not fail', async (t) => {
  await runFixture(t, 'parse_backslash_single_multiline')
})

test('Configuration file - detecting invalid backslash sequences in TOML does not misinterpret equal signs', async (t) => {
  await runFixture(t, 'parse_backslash_equal')
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

test('Headers - duplicate case in same path', async (t) => {
  await runFixture(t, 'headers_duplicate_case_same')
})

test('Headers - duplicate case in different paths', async (t) => {
  await runFixture(t, 'headers_duplicate_case_different')
})
