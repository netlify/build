import { expect, test } from 'vitest'

import { parseHeaders } from './helpers/main.js'

test.each([
  ['empty', {}, []],
  ['only_config', { netlifyConfigPath: 'success' }, [{ for: '/path', values: { test: 'one' } }]],
  [
    'only_files',
    { headersFiles: ['success', 'success_two'] },
    [
      { for: '/path', values: { test: 'one' } },
      { for: '/path', values: { test: 'two' } },
    ],
  ],
  [
    'both_config_files',
    { headersFiles: ['success_two'], netlifyConfigPath: 'success' },
    [
      { for: '/path', values: { test: 'two' } },
      { for: '/path', values: { test: 'one' } },
    ],
  ],
  [
    'config_headers',
    { netlifyConfigPath: 'success', configHeaders: [{ for: '/path', values: { test: ' two ' } }] },
    [
      { for: '/path', values: { test: 'one' } },
      { for: '/path', values: { test: 'two' } },
    ],
  ],
  [
    'duplicates',
    { headersFiles: ['duplicate'], netlifyConfigPath: 'duplicate' },
    [
      { for: '/path', values: { test: 'three' } },
      { for: '/path', values: { test: 'one' } },
      { for: '/path', values: { test: 'two' } },
    ],
  ],
  ['invalid_mixed', { headersFiles: ['success'], configHeaders: [] }, [{ for: '/path', values: { test: 'one' } }]],
])(`Parses netlify.toml and _headers | %s`, async (_, input, output) => {
  const { headers } = await parseHeaders({
    headersFiles: undefined,
    netlifyConfigPath: undefined,
    configHeaders: undefined,
    minimal: true,
    ...input,
  })
  expect(headers).toStrictEqual(output)
})

test.each([
  ['invalid_config_headers_array', { configHeaders: {} }, /must be an array/],
  ['invalid_mixed', { headersFiles: ['simple'], configHeaders: {} }, /must be an array/],
])(`Validates syntax errors | %s`, async (_, input, errorMessage) => {
  // @ts-expect-error -- Intentional runtime test of invalid input for some reason
  const { errors } = await parseHeaders({
    headersFiles: undefined,
    netlifyConfigPath: undefined,
    minimal: true,
    ...input,
  })
  expect(errors).not.toHaveLength(0)
  expect(errors.some((error) => errorMessage.test(error.message))).toBeTruthy()
})
