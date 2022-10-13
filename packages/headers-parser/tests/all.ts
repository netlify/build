import test from 'ava'
import { each } from 'test-each'

import { validateSuccess, validateError } from './helpers/main.js'

each(
  [
    {
      title: 'empty',
      input: {},
      output: [],
    },
    {
      title: 'only_config',
      input: {
        netlifyConfigPath: 'success',
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
    {
      title: 'only_files',
      input: {
        headersFiles: ['success', 'success_two'],
      },
      output: [
        { for: '/path', values: { test: 'one' } },
        { for: '/path', values: { test: 'two' } },
      ],
    },
    {
      title: 'both_config_files',
      input: {
        headersFiles: ['success_two'],
        netlifyConfigPath: 'success',
      },
      output: [
        { for: '/path', values: { test: 'two' } },
        { for: '/path', values: { test: 'one' } },
      ],
    },
    {
      title: 'config_headers',
      input: {
        netlifyConfigPath: 'success',
        configHeaders: [{ for: '/path', values: { test: ' two ' } }],
      },
      output: [
        { for: '/path', values: { test: 'one' } },
        { for: '/path', values: { test: 'two' } },
      ],
    },
    {
      title: 'duplicates',
      input: {
        headersFiles: ['duplicate'],
        netlifyConfigPath: 'duplicate',
      },
      output: [
        { for: '/path', values: { test: 'three' } },
        { for: '/path', values: { test: 'one' } },
        { for: '/path', values: { test: 'two' } },
      ],
    },
    {
      title: 'invalid_mixed',
      input: {
        headersFiles: ['success'],
        configHeaders: {},
      },
      output: [{ for: '/path', values: { test: 'one' } }],
    },
  ],
  ({ title }, { output, input }) => {
    test(`Parses netlify.toml and _headers | ${title}`, async (t) => {
      await validateSuccess(t, { input, output })
    })
  },
)

each(
  [
    {
      title: 'invalid_config_headers_array',
      input: {
        configHeaders: {},
      },
      errorMessage: /must be an array/,
    },
    {
      title: 'invalid_mixed',
      input: {
        headersFiles: ['simple'],
        configHeaders: {},
      },
      errorMessage: /must be an array/,
    },
  ],
  ({ title }, { errorMessage, input }) => {
    test(`Validate syntax errors | ${title}`, async (t) => {
      await validateError(t, { input, errorMessage })
    })
  },
)
