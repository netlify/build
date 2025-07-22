import { expect, test } from 'vitest'

import { parseHeaders } from './helpers/main.js'

test.each([
  ['empty', { headersFiles: ['empty'] }, []],
  ['non_existing', { headersFiles: ['non_existing'] }, []],
  ['trim_line_path', { headersFiles: ['trim_line_path'] }, []],
  ['trim_line_values', { headersFiles: ['trim_line_values'] }, [{ for: '/path', values: { test: 'one' } }]],
  ['empty_line', { headersFiles: ['empty_line'] }, [{ for: '/path', values: { test: 'one' } }]],
  ['comment', { headersFiles: ['comment'] }, [{ for: '/path', values: { test: 'one' } }]],
  ['success', { headersFiles: ['success'] }, [{ for: '/path', values: { test: 'one' } }]],
  ['no_colon', { headersFiles: ['no_colon'] }, []],
  ['trim_name', { headersFiles: ['trim_name'] }, [{ for: '/path', values: { test: 'one' } }]],
  ['trim_value', { headersFiles: ['trim_value'] }, [{ for: '/path', values: { test: 'one' } }]],
  ['multiple_values', { headersFiles: ['multiple_values'] }, [{ for: '/path', values: { test: 'one, two' } }]],
])(`Parses _headers | %s`, async (_, { headersFiles }, output) => {
  const { headers } = await parseHeaders({
    headersFiles,
    netlifyConfigPath: undefined,
    configHeaders: undefined,
    minimal: true,
  })
  expect(headers).toStrictEqual(output)
})

test.each([
  ['invalid_dir', { headersFiles: ['invalid_dir'] }, /read headers file/],
  ['invalid_value_name', { headersFiles: ['invalid_value_name'] }, /Missing header name/],
  ['invalid_value_string', { headersFiles: ['invalid_value_string'] }, /Missing header value/],
  ['invalid_for_order', { headersFiles: ['invalid_for_order'] }, /Path should come before/],
])(`Validate syntax errors | %s`, async (_, { headersFiles }, errorMessage) => {
  const { errors } = await parseHeaders({
    headersFiles,
    netlifyConfigPath: undefined,
    configHeaders: undefined,
    minimal: true,
  })
  expect(errors).not.toHaveLength(0)
  expect(errors.some((error) => errorMessage.test(error.message))).toBeTruthy()
})
