import test from 'ava'
import { each } from 'test-each'

import { validateSuccess } from './helpers/main.js'

each(
  [
    {
      title: 'undefined',
      input: {},
      output: [],
    },
    {
      title: 'empty',
      input: {
        redirectsFiles: ['empty'],
      },
      output: [],
    },
    {
      title: 'simple',
      input: {
        redirectsFiles: ['simple'],
      },
      output: [
        {
          from: '/one',
          path: '/one',
          to: '/two',
        },
      ],
    },
    {
      title: 'only_config',
      input: {
        redirectsFiles: ['empty'],
        configRedirects: [
          {
            from: '/one',
            to: '/three',
          },
        ],
      },
      output: [
        {
          from: '/one',
          path: '/one',
          to: '/three',
        },
      ],
    },
    {
      title: 'simple_merge',
      input: {
        redirectsFiles: ['simple'],
        configRedirects: [
          {
            from: '/one',
            to: '/three',
          },
        ],
      },
      output: [
        {
          from: '/one',
          path: '/one',
          to: '/two',
        },
        {
          from: '/one',
          path: '/one',
          to: '/three',
        },
      ],
    },
    {
      title: 'simple_multiple',
      input: {
        redirectsFiles: ['simple_multiple'],
        configRedirects: [
          {
            from: '/one',
            to: '/two',
          },
          {
            from: '/one',
            to: '/three',
          },
        ],
      },
      output: [
        {
          from: '/one',
          path: '/one',
          to: '/four',
        },
        {
          from: '/one',
          path: '/one',
          to: '/two',
        },
        {
          from: '/one',
          path: '/one',
          to: '/three',
        },
      ],
    },
  ],
  ({ title }, opts) => {
    test(`Merges _redirects with netlify.toml redirects | ${title}`, async (t) => {
      await validateSuccess(t, opts)
    })
  },
)
