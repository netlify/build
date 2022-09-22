import { platform } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('Configuration file - netlify.toml', async (t) => {
  const output = await new Fixture('./fixtures/toml').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

// Windows directory permissions work differently than Unix.
if (platform !== 'win32') {
  test('Configuration file - read permission error', async (t) => {
    const output = await new Fixture().withFlags({ config: `${FIXTURES_DIR}/read_error/netlify.toml` }).runWithConfig()
    t.snapshot(normalizeOutput(output))
  })
}

test('Configuration file - parsing error', async (t) => {
  const output = await new Fixture('./fixtures/parse_error').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Configuration file - valid backslash sequences in TOML should not fail', async (t) => {
  const output = await new Fixture('./fixtures/parse_backslash_valid').runWithConfig()
  t.snapshot(normalizeOutput(output))
  t.true(output.includes('\\\\[this\\\\]\\ntest \\" \\b \\t \\n \\f \\r \\u0000 \\u0000'))
})

test('Configuration file - invalid backslash sequences in double quote strings in TOML should fail', async (t) => {
  const output = await new Fixture('./fixtures/parse_backslash_double').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Configuration file - trailing backslashes in double quote strings in TOML should fail', async (t) => {
  const output = await new Fixture('./fixtures/parse_backslash_trailing_double').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Configuration file - invalid backslash sequences in multiline double quote strings in TOML should fail', async (t) => {
  const output = await new Fixture('./fixtures/parse_backslash_double_multiline').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Configuration file - trailing backslashes in multiline double quotes strings in TOML should not fail', async (t) => {
  const output = await new Fixture('./fixtures/parse_backslash_trailing_double_multiline').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Configuration file - invalid backslash sequences in single quote strings in TOML should not fail', async (t) => {
  const output = await new Fixture('./fixtures/parse_backslash_single').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Configuration file - invalid backslash sequences in multiline single quote strings in TOML should not fail', async (t) => {
  const output = await new Fixture('./fixtures/parse_backslash_single_multiline').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Configuration file - detecting invalid backslash sequences in TOML does not misinterpret equal signs', async (t) => {
  const output = await new Fixture('./fixtures/parse_backslash_equal').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Redirects - redirects file', async (t) => {
  const output = await new Fixture('./fixtures/redirects_file').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Redirects - redirects field', async (t) => {
  const output = await new Fixture('./fixtures/redirects_field').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Redirects - redirects file and redirects field', async (t) => {
  const output = await new Fixture('./fixtures/redirects_both').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Redirects - redirects file syntax error', async (t) => {
  const output = await new Fixture('./fixtures/redirects_file_error').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Redirects - redirects field syntax error', async (t) => {
  const output = await new Fixture('./fixtures/redirects_field_error').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Redirects - no publish field', async (t) => {
  const output = await new Fixture('./fixtures/redirects_no_publish').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Redirects - add redirectsOrigin', async (t) => {
  const output = await new Fixture('./fixtures/empty').withFlags({ defaultConfig: { redirects: [] } }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Redirects - log redirectsOrigin in debug mode', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ defaultConfig: { redirects: [] }, debug: true })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Redirects - does not use redirects file when using inlineConfig with identical redirects', async (t) => {
  const output = await new Fixture('./fixtures/redirects_file')
    .withFlags({ inlineConfig: { redirects: [{ from: '/from', to: '/to' }] } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - file', async (t) => {
  const output = await new Fixture('./fixtures/headers_file').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - field', async (t) => {
  const output = await new Fixture('./fixtures/headers_field').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - file and field', async (t) => {
  const output = await new Fixture('./fixtures/headers_both').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - file syntax error', async (t) => {
  const output = await new Fixture('./fixtures/headers_file_error').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - field syntax error', async (t) => {
  const output = await new Fixture('./fixtures/headers_field_error').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - no publish field', async (t) => {
  const output = await new Fixture('./fixtures/headers_no_publish').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - add headersOrigin', async (t) => {
  const output = await new Fixture('./fixtures/empty').withFlags({ defaultConfig: { headers: [] } }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - log headersOrigin in debug mode', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ defaultConfig: { headers: [] }, debug: true })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - does not use headers file when using inlineConfig with identical headers', async (t) => {
  const output = await new Fixture('./fixtures/headers_file')
    .withFlags({ inlineConfig: { headers: [{ for: '/path', values: { test: 'one' } }] } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - duplicate case in same path', async (t) => {
  const output = await new Fixture('./fixtures/headers_duplicate_case_same').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Headers - duplicate case in different paths', async (t) => {
  const output = await new Fixture('./fixtures/headers_duplicate_case_different').runWithConfig()
  t.snapshot(normalizeOutput(output))
})
