import { expect, test } from 'vitest'

import { normalizeRedirect, parseRedirects } from './helpers/main.js'

test.each([
  ['empty', { netlifyConfigPath: 'empty' }, []],
  ['non_existing', { netlifyConfigPath: 'non_existing' }, []],
  [
    'backward_compat_origin',
    { netlifyConfigPath: 'backward_compat_origin' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path' }],
  ],
  [
    'backward_compat_destination',
    { netlifyConfigPath: 'backward_compat_destination' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path' }],
  ],
  [
    'backward_compat_params',
    { netlifyConfigPath: 'backward_compat_params' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', query: { path: ':path' } }],
  ],
  [
    'backward_compat_parameters',
    { netlifyConfigPath: 'backward_compat_parameters' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', query: { path: ':path' } }],
  ],
  [
    'backward_compat_sign',
    { netlifyConfigPath: 'backward_compat_sign' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', signed: 'api_key' }],
  ],
  [
    'backward_compat_signing',
    { netlifyConfigPath: 'backward_compat_signing' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', signed: 'api_key' }],
  ],
  ['from_simple', { netlifyConfigPath: 'from_simple' }, [{ from: '/old-path', path: '/old-path', to: '/new-path' }]],
  [
    'from_url',
    { netlifyConfigPath: 'from_url' },
    [
      {
        from: 'http://www.example.com/old-path',
        scheme: 'http',
        host: 'www.example.com',
        path: '/old-path',
        to: 'http://www.example.com/new-path',
      },
    ],
  ],
  [
    'status_string',
    { netlifyConfigPath: 'status_string' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', status: 200 }],
  ],
  [
    'from_forward',
    { netlifyConfigPath: 'from_forward' },
    [{ from: '/old-path/*', path: '/old-path/*', to: '/old-path/:splat', status: 200 }],
  ],
  ['from_no_slash', { netlifyConfigPath: 'from_no_slash' }, [{ from: 'old-path', path: 'old-path', to: 'new-path' }]],
  [
    'query',
    { netlifyConfigPath: 'query' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', query: { path: ':path' } }],
  ],
  [
    'conditions_country_case',
    { netlifyConfigPath: 'conditions_country_case' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', conditions: { Country: ['US'] } }],
  ],
  [
    'conditions_language_case',
    { netlifyConfigPath: 'conditions_language_case' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', conditions: { Language: ['en'] } }],
  ],
  [
    'conditions_role_case',
    { netlifyConfigPath: 'conditions_role_case' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', conditions: { Role: ['admin'] } }],
  ],
  [
    'signed',
    { netlifyConfigPath: 'signed' },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', signed: 'api_key' }],
  ],
  [
    'complex',
    { netlifyConfigPath: 'complex' },
    [
      {
        from: '/old-path',
        path: '/old-path',
        to: '/new-path',
        status: 301,
        query: { path: ':path' },
        conditions: { Country: ['US'], Language: ['en'], Role: ['admin'] },
      },
      {
        from: '/search',
        path: '/search',
        to: 'https://api.mysearch.com',
        status: 200,
        proxy: true,
        force: true,
        signed: 'API_SIGNATURE_TOKEN',
        headers: { 'X-From': 'Netlify' },
      },
    ],
  ],
  [
    'minimal',
    { netlifyConfigPath: 'minimal', minimal: true },
    [
      {
        from: '/here',
        to: '/there',
        status: 200,
        force: true,
        signed: 'API_SIGNATURE_TOKEN',
        headers: { 'X-From': 'Netlify' },
        query: { path: ':path' },
        conditions: { Country: ['US'], Language: ['en'], Role: ['admin'] },
      },
    ],
  ],
  [
    'with rate limits',
    { netlifyConfigPath: 'with_ratelimit' },
    [
      {
        from: '/old-path',
        path: '/old-path',
        to: '/new-path',
        status: 301,
        query: { path: ':path' },
        conditions: { Country: ['US'], Language: ['en'], Role: ['admin'] },
        rate_limit: {
          window_limit: 40,
          aggregate_by: ['ip'],
        },
      },
      {
        from: '/other/*',
        path: '/other/*',
        to: '/maybe_rewritten',
        proxy: false,
        force: false,
        rate_limit: {
          action: 'rewrite',
          to: '/rewritten',
          window_limit: 40,
          window_size: 20,
          aggregate_by: ['ip', 'domain'],
        },
      },
    ],
  ],
])(`Parses netlify.toml redirects | %s`, async (_, input, output) => {
  const { redirects } = await parseRedirects(input)
  const normalized = output.map((redirect) => normalizeRedirect(redirect, input))
  expect(redirects).toStrictEqual(normalized)
})

test.each([
  ['invalid_toml', { netlifyConfigPath: 'invalid_toml' }, /parse configuration file/],
  ['invalid_type', { netlifyConfigPath: 'invalid_type' }, /must be an array/],
  ['invalid_object', { netlifyConfigPath: 'invalid_object' }, /must be objects/],
  ['invalid_no_from', { netlifyConfigPath: 'invalid_no_from' }, /Missing "from"/],
  ['invalid_no_to', { netlifyConfigPath: 'invalid_no_to' }, /Missing "to"/],
  ['invalid_status_string', { netlifyConfigPath: 'invalid_status_string' }, /Invalid status code/],
  ['invalid_status_empty', { netlifyConfigPath: 'invalid_status_empty' }, /Invalid status code/],
  ['invalid_forward_status', { netlifyConfigPath: 'invalid_forward_status' }, /Missing "to"/],
  ['invalid_url', { netlifyConfigPath: 'invalid_url' }, /Invalid URL/],
  ['invalid_dot_netlify_url', { netlifyConfigPath: 'invalid_dot_netlify_url' }, /must not start/],
  ['invalid_dot_netlify_path', { netlifyConfigPath: 'invalid_dot_netlify_path' }, /must not start/],
  ['invalid_headers', { netlifyConfigPath: 'invalid_headers' }, /must be an object/],
])(`Validate syntax errors | %s`, async (_, input, errorMessage) => {
  const { errors } = await parseRedirects(input)
  expect(errors).not.toHaveLength(0)
  expect(errors.some((error) => errorMessage.test(error.message))).toBeTruthy()
})
