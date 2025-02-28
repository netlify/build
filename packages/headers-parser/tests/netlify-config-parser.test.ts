import { expect, test } from 'vitest'

import { parseHeaders } from './helpers/main.js'

test.each([
  ['empty', { netlifyConfigPath: 'empty' }, []],
  ['non_existing', { netlifyConfigPath: 'non_existing' }, []],
  ['success', { netlifyConfigPath: 'success' }, [{ for: '/path', values: { test: 'one' } }]],
  ['trim_path', { netlifyConfigPath: 'trim_path' }, [{ for: '/path', values: { test: 'one' } }]],
  ['trim_name', { netlifyConfigPath: 'trim_name' }, [{ for: '/path', values: { test: 'one' } }]],
  ['trim_value', { netlifyConfigPath: 'trim_value' }, [{ for: '/path', values: { test: 'one' } }]],
  ['trim_value_array', { netlifyConfigPath: 'trim_value_array' }, [{ for: '/path', values: { test: 'one, two' } }]],
  ['multiple_values', { netlifyConfigPath: 'multiple_values' }, [{ for: '/path', values: { test: 'one, two' } }]],
  ['values_undefined', { netlifyConfigPath: 'values_undefined' }, []],
  ['value_array', { netlifyConfigPath: 'value_array' }, [{ for: '/path', values: { test: 'one, two' } }]],
  ['for_path_no_slash', { netlifyConfigPath: 'for_path_no_slash' }, [{ for: 'path', values: { test: 'one' } }]],
])(`Parses netlify.toml headers | %s`, async (_, { netlifyConfigPath }, output) => {
  const { headers } = await parseHeaders({
    headersFiles: undefined,
    netlifyConfigPath,
    configHeaders: undefined,
    minimal: true,
  })
  expect(headers).toStrictEqual(output)
})

test.each([
  ['invalid_toml', { netlifyConfigPath: 'invalid_toml' }, /parse configuration file/],
  ['invalid_array', { netlifyConfigPath: 'invalid_array' }, /must be an array/],
  ['invalid_object', { netlifyConfigPath: 'invalid_object' }, /must be an object/],
  ['invalid_for_undefined', { netlifyConfigPath: 'invalid_for_undefined' }, /Missing "for"/],
  ['invalid_for_string', { netlifyConfigPath: 'invalid_for_string' }, /must be a string/],
  ['invalid_values_object', { netlifyConfigPath: 'invalid_values_object' }, /must be an object/],
  ['invalid_value_name', { netlifyConfigPath: 'invalid_value_name' }, /Empty header name/],
  ['invalid_value_string', { netlifyConfigPath: 'invalid_value_string' }, /must be a string/],
  ['invalid_value_array', { netlifyConfigPath: 'invalid_value_array' }, /must be a string/],
])(`Validate syntax errors | %s`, async (_, { netlifyConfigPath }, errorMessage) => {
  const { errors } = await parseHeaders({
    headersFiles: undefined,
    netlifyConfigPath,
    configHeaders: undefined,
    minimal: true,
  })
  expect(errors).not.toHaveLength(0)
  expect(errors.some((error) => errorMessage.test(error.message))).toBeTruthy()
})
