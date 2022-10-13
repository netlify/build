import test from 'ava'
import { each } from 'test-each'

import { validateSuccess, validateErrors } from './helpers/main.js'

each(
  [
    {
      title: 'empty',
      input: {
        redirectsFiles: ['empty'],
      },
      output: [],
    },
    {
      title: 'non_existing',
      input: {
        redirectsFiles: ['non_existing'],
      },
      output: [],
    },
    {
      title: 'empty_line',
      input: {
        redirectsFiles: ['empty_line'],
      },
      output: [
        {
          from: '/blog/my-post.php',
          path: '/blog/my-post.php',
          to: '/blog/my-post',
        },
        {
          from: '/blog/my-post-two.php',
          path: '/blog/my-post-two.php',
          to: '/blog/my-post-two',
        },
      ],
    },
    {
      title: 'multiple_lines',
      input: {
        redirectsFiles: ['multiple_lines'],
      },
      output: [
        {
          from: '/10thmagnitude',
          path: '/10thmagnitude',
          to: 'http://www.10thmagnitude.com/',
          status: 301,
        },
        {
          from: '/bananastand',
          path: '/bananastand',
          to: 'http://eepurl.com/Lgde5',
          status: 301,
        },
      ],
    },
    {
      title: 'line_trim',
      input: {
        redirectsFiles: ['line_trim'],
      },
      output: [
        {
          from: '/home',
          path: '/home',
          to: '/',
        },
      ],
    },
    {
      title: 'comment_full',
      input: {
        redirectsFiles: ['comment_full'],
      },
      output: [
        {
          from: '/blog/my-post.php',
          path: '/blog/my-post.php',
          to: '/blog/my-post',
        },
      ],
    },
    {
      title: 'comment_inline',
      input: {
        redirectsFiles: ['comment_inline'],
      },
      output: [
        {
          from: '/blog/my-post.php',
          path: '/blog/my-post.php',
          to: '/blog/my-post',
        },
      ],
    },
    {
      title: 'from_simple',
      input: {
        redirectsFiles: ['from_simple'],
      },
      output: [
        {
          from: '/home',
          path: '/home',
          to: '/',
        },
      ],
    },
    {
      title: 'from_absolute_uri',
      input: {
        redirectsFiles: ['from_absolute_uri'],
      },
      output: [
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
      title: 'query',
      input: {
        redirectsFiles: ['query'],
      },
      output: [
        {
          from: '/',
          path: '/',
          to: '/news',
          query: { page: 'news' },
        },
        {
          from: '/blog',
          path: '/blog',
          to: '/blog/:post_id',
          query: { post: ':post_id' },
        },
        {
          from: '/',
          path: '/',
          to: '/about',
          query: { _escaped_fragment_: '/about' },
        },
      ],
    },
    {
      title: 'to_anchor',
      input: {
        redirectsFiles: ['to_anchor'],
      },
      output: [
        {
          from: '/blog/my-post-ads.php',
          path: '/blog/my-post-ads.php',
          to: '/blog/my-post#ads',
        },
      ],
    },
    {
      title: 'to_splat_no_force',
      input: {
        redirectsFiles: ['to_splat_no_force'],
      },
      output: [
        {
          from: '/*',
          path: '/*',
          to: 'https://www.bitballoon.com/:splat',
          status: 301,
        },
      ],
    },
    {
      title: 'to_splat_force',
      input: {
        redirectsFiles: ['to_splat_force'],
      },
      output: [
        {
          from: '/*',
          path: '/*',
          to: 'https://www.bitballoon.com/:splat',
          status: 301,
          force: true,
        },
      ],
    },
    {
      title: 'to_path_forward',
      input: {
        redirectsFiles: ['to_path_forward'],
      },
      output: [
        {
          from: '/admin/*',
          path: '/admin/*',
          to: '/admin/:splat',
          status: 200,
        },
        {
          from: '/admin/*',
          path: '/admin/*',
          to: '/admin/:splat',
          status: 200,
          force: true,
        },
      ],
    },
    {
      title: 'proxy',
      input: {
        redirectsFiles: ['proxy'],
      },
      output: [
        {
          from: '/api/*',
          path: '/api/*',
          to: 'https://api.bitballoon.com/*',
          status: 200,
          proxy: true,
        },
      ],
    },
    {
      title: 'status',
      input: {
        redirectsFiles: ['status'],
      },
      output: [
        {
          from: '/test',
          path: '/test',
          to: 'https://www.bitballoon.com/test=hello',
          status: 301,
        },
      ],
    },
    {
      title: 'status_force',
      input: {
        redirectsFiles: ['status_force'],
      },
      output: [
        {
          from: '/test',
          path: '/test',
          to: 'https://www.bitballoon.com/test=hello',
          status: 301,
          force: true,
        },
      ],
    },
    {
      title: 'conditions_country',
      input: {
        redirectsFiles: ['conditions_country'],
      },
      output: [
        {
          from: '/',
          path: '/',
          to: '/china',
          status: 302,
          conditions: { Country: ['ch', 'tw'] },
        },
      ],
    },
    {
      title: 'conditions_country_language',
      input: {
        redirectsFiles: ['conditions_country_language'],
      },
      output: [
        {
          from: '/',
          path: '/',
          to: '/china',
          status: 302,
          conditions: { Country: ['il'], Language: ['en'] },
        },
      ],
    },
    {
      title: 'conditions_role',
      input: {
        redirectsFiles: ['conditions_role'],
      },
      output: [
        {
          from: '/admin/*',
          path: '/admin/*',
          to: '/admin/:splat',
          status: 200,
          conditions: { Role: ['admin'] },
        },
      ],
    },
    {
      title: 'conditions_roles',
      input: {
        redirectsFiles: ['conditions_roles'],
      },
      output: [
        {
          from: '/member/*',
          path: '/member/*',
          to: '/member/:splat',
          status: 200,
          conditions: { Role: ['admin', 'member'] },
        },
      ],
    },
    {
      title: 'conditions_query',
      input: {
        redirectsFiles: ['conditions_query'],
      },
      output: [
        {
          from: '/donate',
          path: '/donate',
          to: '/donate/usa?source=:source&email=:email',
          status: 302,
          query: { source: ':source', email: ':email' },
          conditions: { Country: ['us'] },
        },
      ],
    },
    {
      title: 'conditions_country_case',
      input: {
        redirectsFiles: ['conditions_country_case'],
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          status: 200,
          conditions: { Country: ['US'] },
        },
      ],
    },
    {
      title: 'conditions_language_case',
      input: {
        redirectsFiles: ['conditions_language_case'],
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          status: 200,
          conditions: { Language: ['en'] },
        },
      ],
    },
    {
      title: 'conditions_role_case',
      input: {
        redirectsFiles: ['conditions_role_case'],
      },
      output: [
        {
          from: '/old-path',
          path: '/old-path',
          to: '/new-path',
          status: 200,
          conditions: { Role: ['admin'] },
        },
      ],
    },
    {
      title: 'signed',
      input: {
        redirectsFiles: ['signed'],
      },
      output: [
        {
          from: '/api/*',
          path: '/api/*',
          to: 'https://api.example.com/:splat',
          status: 200,
          proxy: true,
          force: true,
          signed: 'API_SECRET',
        },
      ],
    },
    {
      title: 'signed_backward_compat',
      input: {
        redirectsFiles: ['signed_backward_compat'],
      },
      output: [
        {
          from: '/api/*',
          path: '/api/*',
          to: 'https://api.example.com/:splat',
          status: 200,
          proxy: true,
          force: true,
          signed: 'API_SECRET',
        },
      ],
    },
  ],
  ({ title }, opts) => {
    test(`Parses _redirects | ${title}`, async (t) => {
      await validateSuccess(t, opts)
    })
  },
)

each(
  [
    {
      title: 'invalid_dir',
      input: {
        redirectsFiles: ['invalid_dir'],
      },
      errorMessage: /read redirects file/,
    },
    {
      title: 'invalid_url',
      input: {
        redirectsFiles: ['invalid_url'],
      },
      errorMessage: /Invalid URL/,
    },
    {
      title: 'invalid_dot_netlify_url',
      input: {
        redirectsFiles: ['invalid_dot_netlify_url'],
      },
      errorMessage: /must not start/,
    },
    {
      title: 'invalid_dot_netlify_path',
      input: {
        redirectsFiles: ['invalid_dot_netlify_path'],
      },
      errorMessage: /must not start/,
    },
    {
      title: 'invalid_status',
      input: {
        redirectsFiles: ['invalid_status'],
      },
      errorMessage: /Invalid status code/,
    },
    {
      title: 'invalid_no_to_no_status',
      input: {
        redirectsFiles: ['invalid_no_to_no_status'],
      },
      errorMessage: /Missing destination/,
    },
    {
      title: 'invalid_no_to_status',
      input: {
        redirectsFiles: ['invalid_no_to_status'],
      },
      errorMessage: /Missing "to" field/,
    },
    {
      title: 'invalid_no_to_query',
      input: {
        redirectsFiles: ['invalid_no_to_query'],
      },
      errorMessage: /must start with/,
    },
    {
      title: 'invalid_no_slash',
      input: {
        redirectsFiles: ['invalid_no_slash'],
      },
      errorMessage: /must start with/,
    },
    {
      title: 'invalid_mistaken_headers',
      input: {
        redirectsFiles: ['invalid_mistaken_headers'],
      },
      errorMessage: /Missing destination/,
    },
  ],
  ({ title }, opts) => {
    test(`Validate syntax errors | ${title}`, async (t) => {
      await validateErrors(t, opts)
    })
  },
)
