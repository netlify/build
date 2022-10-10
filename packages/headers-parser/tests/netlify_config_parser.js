import test from 'ava'
import { each } from 'test-each'

import { validateSuccess, validateError } from './helpers/main.js'

each(
  [
    {
      title: 'empty',
      input: {
        netlifyConfigPath: 'empty',
      },
      output: [],
    },
    {
      title: 'non_existing',
      input: {
        netlifyConfigPath: 'non_existing',
      },
      output: [],
    },
    {
      title: 'success',
      input: {
        netlifyConfigPath: 'success',
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'trim_path',
      input: {
        netlifyConfigPath: 'trim_path',
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'trim_name',
      input: {
        netlifyConfigPath: 'trim_name',
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'trim_value',
      input: {
        netlifyConfigPath: 'trim_value',
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'trim_value_array',
      input: {
        netlifyConfigPath: 'trim_value_array',
      },
      output: [{ for: '/path', values: { test: 'one, two' } }],
    },
    {
      title: 'multiple_values',
      input: {
        netlifyConfigPath: 'multiple_values',
      },
      output: [{ for: '/path', values: { test: 'one, two' } }],
    },
    {
      title: 'values_undefined',
      input: {
        netlifyConfigPath: 'values_undefined',
      },
      output: [],
    },
    {
      title: 'value_array',
      input: {
        netlifyConfigPath: 'value_array',
      },
      output: [{ for: '/path', values: { test: 'one, two' } }],
    },
    {
      title: 'for_path_no_slash',
      input: {
        netlifyConfigPath: 'for_path_no_slash',
      },
      output: [{ for: 'path', values: { test: 'one' } }],
    },
  ],
  ({ title }, { output, input }) => {
    test(`Parses netlify.toml headers | ${title}`, async (t) => {
      await validateSuccess(t, { input, output })
    })
  },
)

each(
  [
    {
      title: 'invalid_toml',
      input: {
        netlifyConfigPath: 'invalid_toml',
      },
      errorMessage: /parse configuration file/,
    },
    {
      title: 'invalid_array',
      input: {
        netlifyConfigPath: 'invalid_array',
      },
      errorMessage: /must be an array/,
    },
    {
      title: 'invalid_object',
      input: {
        netlifyConfigPath: 'invalid_object',
      },
      errorMessage: /must be an object/,
    },
    {
      title: 'invalid_for_undefined',
      input: {
        netlifyConfigPath: 'invalid_for_undefined',
      },
      errorMessage: /Missing "for"/,
    },
    {
      title: 'invalid_for_string',
      input: {
        netlifyConfigPath: 'invalid_for_string',
      },
      errorMessage: /must be a string/,
    },
    {
      title: 'invalid_values_object',
      input: {
        netlifyConfigPath: 'invalid_values_object',
      },
      errorMessage: /must be an object/,
    },
    {
      title: 'invalid_value_name',
      input: {
        netlifyConfigPath: 'invalid_value_name',
      },
      errorMessage: /Empty header name/,
    },
    {
      title: 'invalid_value_string',
      input: {
        netlifyConfigPath: 'invalid_value_string',
      },
      errorMessage: /must be a string/,
    },
    {
      title: 'invalid_value_array',
      input: {
        netlifyConfigPath: 'invalid_value_array',
      },
      errorMessage: /must be a string/,
    },
  ],
  ({ title }, { errorMessage, input }) => {
    test(`Validate syntax errors | ${title}`, async (t) => {
      await validateError(t, { input, errorMessage })
    })
  },
)
