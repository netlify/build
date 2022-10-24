import test from 'ava'
import { each } from 'test-each'

import { validateSuccess, validateErrors } from './helpers/main.js'

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
      title: 'only_files',
      input: {
        redirectsFiles: ['from_simple', 'from_absolute_uri'],
      },
      output: [
        {
          from: '/home',
          path: '/home',
          to: '/',
        },
        {
          from: 'http://hello.bitballoon.com/*',
          scheme: 'http',
          host: 'hello.bitballoon.com',
          path: '/*',
          to: 'http://www.hello.com/:splat',
        },
      ],
    },
    {
      title: 'both_config_files',
      input: {
        redirectsFiles: ['from_simple', 'from_absolute_uri'],
        netlifyConfigPath: 'from_simple',
      },
      output: [
        {
          from: '/home',
          path: '/home',
          to: '/',
        },
        {
          from: 'http://hello.bitballoon.com/*',
          scheme: 'http',
          host: 'hello.bitballoon.com',
          path: '/*',
          to: 'http://www.hello.com/:splat',
        },
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
        },
      ],
    },
    {
      title: 'config_redirects',
      input: {
        netlifyConfigPath: 'from_simple',
        configRedirects: [
          {
            from: '/home',
            to: '/',
          },
        ],
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
        },
        {
          from: '/home',
          path: '/home',
          to: '/',
        },
      ],
    },
    {
      title: 'minimal',
      input: {
        redirectsFiles: ['from_simple', 'from_absolute_uri'],
        netlifyConfigPath: 'from_simple',
        minimal: true,
      },
      output: [
        {
          from: '/home',
          to: '/',
        },
        {
          from: 'http://hello.bitballoon.com/*',
          to: 'http://www.hello.com/:splat',
        },
        {
          from: '/old-path',
          to: '/new-path',
        },
      ],
    },
    {
      title: 'valid_redirects_mixed',
      input: {
        redirectsFiles: ['from_simple'],
        configRedirects: {},
      },
      output: [
        {
          from: '/home',
          path: '/home',
          to: '/',
        },
      ],
    },
  ],
  ({ title }, opts) => {
    test(`Parses netlify.toml and _redirects | ${title}`, async (t) => {
      await validateSuccess(t, opts)
    })
  },
)

each(
  [
    {
      title: 'invalid_redirects_array',
      input: {
        configRedirects: {},
      },
      errorMessage: /must be an array/,
    },
    {
      title: 'invalid_redirects_mixed',
      input: {
        redirectsFiles: ['from_simple'],
        configRedirects: {},
      },
      errorMessage: /must be an array/,
    },
  ],
  ({ title }, opts) => {
    test(`Validate syntax errors | ${title}`, async (t) => {
      await validateErrors(t, opts)
    })
  },
)
