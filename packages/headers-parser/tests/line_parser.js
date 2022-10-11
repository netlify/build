import test from 'ava'
import { each } from 'test-each'

import { validateSuccess, validateError } from './helpers/main.js'

each(
  [
    {
      title: 'empty',
      input: {
        headersFiles: ['empty'],
      },
      output: [],
    },
    {
      title: 'non_existing',
      input: {
        headersFiles: ['non_existing'],
      },
      output: [],
    },
    {
      title: 'trim_line_path',
      input: {
        headersFiles: ['trim_line_path'],
      },
      output: [],
    },
    {
      title: 'trim_line_values',
      input: {
        headersFiles: ['trim_line_values'],
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'empty_line',
      input: {
        headersFiles: ['empty_line'],
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'comment',
      input: {
        headersFiles: ['comment'],
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'success',
      input: {
        headersFiles: ['success'],
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'no_colon',
      input: {
        headersFiles: ['no_colon'],
      },
      output: [],
    },
    {
      title: 'trim_name',
      input: {
        headersFiles: ['trim_name'],
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'trim_value',
      input: {
        headersFiles: ['trim_value'],
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'multiple_values',
      input: {
        headersFiles: ['multiple_values'],
      },
      output: [{ for: '/path', values: { test: 'one, two' } }],
    },
  ],
  ({ title }, { output, input }) => {
    test(`Parses _headers | ${title}`, async (t) => {
      await validateSuccess(t, { input, output })
    })
  },
)

each(
  [
    {
      title: 'invalid_dir',
      input: {
        headersFiles: ['invalid_dir'],
      },
      errorMessage: /read headers file/,
    },
    {
      title: 'invalid_value_name',
      input: {
        headersFiles: ['invalid_value_name'],
      },
      errorMessage: /Missing header name/,
    },
    {
      title: 'invalid_value_string',
      input: {
        headersFiles: ['invalid_value_string'],
      },
      errorMessage: /Missing header value/,
    },
    {
      title: 'invalid_for_order',
      input: {
        headersFiles: ['invalid_for_order'],
      },
      errorMessage: /Path should come before/,
    },
  ],
  ({ title }, { errorMessage, input }) => {
    test(`Validate syntax errors | ${title}`, async (t) => {
      await validateError(t, { input, errorMessage })
    })
  },
)
