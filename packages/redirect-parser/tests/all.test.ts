import { expect, test } from 'vitest'

import { normalizeRedirect, parseRedirects } from './helpers/main.js'

test.each([
  ['empty', {}, []],
  ['only_config', { netlifyConfigPath: 'from_simple' }, [{ from: '/old-path', path: '/old-path', to: '/new-path' }]],
  [
    'only_files',
    { redirectsFiles: ['from_simple', 'from_absolute_uri'] },
    [
      { from: '/home', path: '/home', to: '/' },
      {
        from: 'http://hello.bitballoon.com/*',
        scheme: 'http',
        host: 'hello.bitballoon.com',
        path: '/*',
        to: 'http://www.hello.com/:splat',
      },
    ],
  ],
  [
    'both_config_files',
    { redirectsFiles: ['from_simple', 'from_absolute_uri'], netlifyConfigPath: 'from_simple' },
    [
      { from: '/home', path: '/home', to: '/' },
      {
        from: 'http://hello.bitballoon.com/*',
        scheme: 'http',
        host: 'hello.bitballoon.com',
        path: '/*',
        to: 'http://www.hello.com/:splat',
      },
      { from: '/old-path', path: '/old-path', to: '/new-path' },
    ],
  ],
  [
    'config_redirects',
    { netlifyConfigPath: 'from_simple', configRedirects: [{ from: '/home', to: '/' }] },
    [
      { from: '/old-path', path: '/old-path', to: '/new-path' },
      { from: '/home', path: '/home', to: '/' },
    ],
  ],
  [
    'minimal',
    { redirectsFiles: ['from_simple', 'from_absolute_uri'], netlifyConfigPath: 'from_simple', minimal: true },
    [
      { from: '/home', to: '/' },
      { from: 'http://hello.bitballoon.com/*', to: 'http://www.hello.com/:splat' },
      { from: '/old-path', to: '/new-path' },
    ],
  ],
  [
    'valid_redirects_mixed',
    { redirectsFiles: ['from_simple'], configRedirects: {} },
    [{ from: '/home', path: '/home', to: '/' }],
  ],
])(`Parses netlify.toml and _redirects | %s`, async (_, input, output) => {
  const { redirects } = await parseRedirects(input)
  const normalized = output.map((redirect) => normalizeRedirect(redirect, input))
  expect(redirects).toStrictEqual(normalized)
})

test.each([
  ['invalid_redirects_array', { configRedirects: {} }, /must be an array/],
  ['invalid_redirects_mixed', { redirectsFiles: ['from_simple'], configRedirects: {} }, /must be an array/],
])(`Validate syntax errors | %s`, async (_, input, errorMessage) => {
  const { errors } = await parseRedirects(input)
  expect(errors).not.toHaveLength(0)
  expect(errors.some((error) => errorMessage.test(error.message))).toBeTruthy()
})
