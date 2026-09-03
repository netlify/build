import { platform } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('Configuration file - netlify.toml', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/toml').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

// Windows directory permissions work differently than Unix.
if (platform !== 'win32') {
  test('Configuration file - read permission error', async () => {
    const output = await new Fixture().withFlags({ config: `${FIXTURES_DIR}/read_error/netlify.toml` }).runWithConfig()
    expect(normalizeOutput(output)).toMatchSnapshot()
  })
}

test('Configuration file - parsing error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/parse_error').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Configuration file - valid backslash sequences in TOML should not fail', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/parse_backslash_valid').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(output.includes('\\\\[this\\\\]\\ntest \\" \\b \\t \\n \\f \\r \\u0000 \\u0000')).toBe(true)
})

test('Configuration file - invalid backslash sequences in double quote strings in TOML should fail', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/parse_backslash_double').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Configuration file - trailing backslashes in double quote strings in TOML should fail', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/parse_backslash_trailing_double').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Configuration file - invalid backslash sequences in multiline double quote strings in TOML should fail', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/parse_backslash_double_multiline').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Configuration file - trailing backslashes in multiline double quotes strings in TOML should not fail', async () => {
  const output = await new Fixture(
    import.meta.url,
    './fixtures/parse_backslash_trailing_double_multiline',
  ).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Configuration file - invalid backslash sequences in single quote strings in TOML should not fail', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/parse_backslash_single').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Configuration file - invalid backslash sequences in multiline single quote strings in TOML should not fail', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/parse_backslash_single_multiline').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Configuration file - detecting invalid backslash sequences in TOML does not misinterpret equal signs', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/parse_backslash_equal').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Redirects - redirects file', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/redirects_file').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Redirects - redirects field', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/redirects_field').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Redirects - redirects file and redirects field', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/redirects_both').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Redirects - redirects file syntax error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/redirects_file_error').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Redirects - redirects field syntax error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/redirects_field_error').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Redirects - no publish field', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/redirects_no_publish').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Redirects - add redirectsOrigin', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ defaultConfig: { redirects: [] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Redirects - log redirectsOrigin in debug mode', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ defaultConfig: { redirects: [] }, debug: true })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Redirects - does not use redirects file when using inlineConfig with identical redirects', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/redirects_file')
    .withFlags({ inlineConfig: { redirects: [{ from: '/from', to: '/to' }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - file', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_file').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - field', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_field').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - file and field', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_both').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - file syntax error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_file_error').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - field syntax error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_field_error').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - no publish field', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_no_publish').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - add headersOrigin', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ defaultConfig: { headers: [] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - log headersOrigin in debug mode', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ defaultConfig: { headers: [] }, debug: true })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - does not use headers file when using inlineConfig with identical headers', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_file')
    .withFlags({ inlineConfig: { headers: [{ for: '/path', values: { test: 'one' } }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - duplicate case in same path', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_duplicate_case_same').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Headers - duplicate case in different paths', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/headers_duplicate_case_different').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
