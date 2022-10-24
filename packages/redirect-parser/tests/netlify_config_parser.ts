import test from 'ava'
import { each } from 'test-each'

import { validateSuccess, validateErrors } from './helpers/main.js'

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
      title: 'backward_compat_origin',
      input: {
        netlifyConfigPath: 'backward_compat_origin',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
        },
      ],
    },
    {
      title: 'backward_compat_destination',
      input: {
        netlifyConfigPath: 'backward_compat_destination',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
        },
      ],
    },
    {
      title: 'backward_compat_params',
      input: {
        netlifyConfigPath: 'backward_compat_params',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          query: { path: ':path' },
        },
      ],
    },
    {
      title: 'backward_compat_parameters',
      input: {
        netlifyConfigPath: 'backward_compat_parameters',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          query: { path: ':path' },
        },
      ],
    },
    {
      title: 'backward_compat_sign',
      input: {
        netlifyConfigPath: 'backward_compat_sign',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          signed: 'api_key',
        },
      ],
    },
    {
      title: 'backward_compat_signing',
      input: {
        netlifyConfigPath: 'backward_compat_signing',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          signed: 'api_key',
        },
      ],
    },
    {
      title: 'from_simple',
      input: {
        netlifyConfigPath: 'from_simple',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
        },
      ],
    },
    {
      title: 'from_url',
      input: {
        netlifyConfigPath: 'from_url',
      },
      output: [
        {
          from: 'http://www.example.com/old-path',
          scheme: 'http',
          host: 'www.example.com',
          path: '/old-path',
          to: 'http://www.example.com/new-path',
        },
      ],
    },
    {
      title: 'status_string',
      input: {
        netlifyConfigPath: 'status_string',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          status: 200,
        },
      ],
    },
    {
      title: 'from_forward',
      input: {
        netlifyConfigPath: 'from_forward',
      },
      output: [
        {
          from: '/old-path/*',
          path: '/old-path/*',
          to: '/old-path/:splat',
          status: 200,
        },
      ],
    },
    {
      title: 'from_no_slash',
      input: {
        netlifyConfigPath: 'from_no_slash',
      },
      output: [
        {
          from: 'old-path',
          path: 'old-path',
          to: 'new-path',
        },
      ],
    },
    {
      title: 'query',
      input: {
        netlifyConfigPath: 'query',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          query: { path: ':path' },
        },
      ],
    },
    {
      title: 'conditions_country_case',
      input: {
        netlifyConfigPath: 'conditions_country_case',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          conditions: { Country: ['US'] },
        },
      ],
    },
    {
      title: 'conditions_language_case',
      input: {
        netlifyConfigPath: 'conditions_language_case',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          conditions: { Language: ['en'] },
        },
      ],
    },
    {
      title: 'conditions_role_case',
      input: {
        netlifyConfigPath: 'conditions_role_case',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          conditions: { Role: ['admin'] },
        },
      ],
    },
    {
      title: 'signed',
      input: {
        netlifyConfigPath: 'signed',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          signed: 'api_key',
        },
      ],
    },
    {
      title: 'complex',
      input: {
        netlifyConfigPath: 'complex',
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          status: 301,
          query: {
            path: ':path',
          },
          conditions: {
            Country: ['US'],
            Language: ['en'],
            Role: ['admin'],
          },
        },
        {
          from: '/search',
          path: '/search',
          to: 'https://api.mysearch.com',
          status: 200,
          proxy: true,
          force: true,
          signed: 'API_SIGNATURE_TOKEN',
          headers: {
            'X-From': 'Netlify',
          },
        },
      ],
    },
    {
      title: 'minimal',
      input: {
        netlifyConfigPath: 'minimal',
        minimal: true,
      },
      output: [
        {
          from: '/here',
          to: '/there',
          status: 200,
          force: true,
          signed: 'API_SIGNATURE_TOKEN',
          headers: {
            'X-From': 'Netlify',
          },
          query: {
            path: ':path',
          },
          conditions: {
            Country: ['US'],
            Language: ['en'],
            Role: ['admin'],
          },
        },
      ],
    },
  ],
  ({ title }, opts) => {
    test(`Parses netlify.toml redirects | ${title}`, async (t) => {
      await validateSuccess(t, opts)
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
      title: 'invalid_type',
      input: {
        netlifyConfigPath: 'invalid_type',
      },
      errorMessage: /must be an array/,
    },
    {
      title: 'invalid_object',
      input: {
        netlifyConfigPath: 'invalid_object',
      },
      errorMessage: /must be objects/,
    },
    {
      title: 'invalid_no_from',
      input: {
        netlifyConfigPath: 'invalid_no_from',
      },
      errorMessage: /Missing "from"/,
    },
    {
      title: 'invalid_no_to',
      input: {
        netlifyConfigPath: 'invalid_no_to',
      },
      errorMessage: /Missing "to"/,
    },
    {
      title: 'invalid_status_string',
      input: {
        netlifyConfigPath: 'invalid_status_string',
      },
      errorMessage: /Invalid status code/,
    },
    {
      title: 'invalid_status_empty',
      input: {
        netlifyConfigPath: 'invalid_status_empty',
      },
      errorMessage: /Invalid status code/,
    },
    {
      title: 'invalid_forward_status',
      input: {
        netlifyConfigPath: 'invalid_forward_status',
      },
      errorMessage: /Missing "to"/,
    },
    {
      title: 'invalid_url',
      input: {
        netlifyConfigPath: 'invalid_url',
      },
      errorMessage: /Invalid URL/,
    },
    {
      title: 'invalid_dot_netlify_url',
      input: {
        netlifyConfigPath: 'invalid_dot_netlify_url',
      },
      errorMessage: /must not start/,
    },
    {
      title: 'invalid_dot_netlify_path',
      input: {
        netlifyConfigPath: 'invalid_dot_netlify_path',
      },
      errorMessage: /must not start/,
    },
    {
      title: 'invalid_headers',
      input: {
        netlifyConfigPath: 'invalid_headers',
      },
      errorMessage: /must be an object/,
    },
  ],
  ({ title }, opts) => {
    test(`Validate syntax errors | ${title}`, async (t) => {
      await validateErrors(t, opts)
    })
  },
)
