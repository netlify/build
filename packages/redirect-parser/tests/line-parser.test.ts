import { expect, test } from 'vitest'

import { normalizeRedirect, parseRedirects } from './helpers/main.js'

test.each([
  ['empty', { redirectsFiles: ['empty'] }, []],
  ['non_existing', { redirectsFiles: ['non_existing'] }, []],
  [
    'empty_line',
    { redirectsFiles: ['empty_line'] },
    [
      { from: '/blog/my-post.php', path: '/blog/my-post.php', to: '/blog/my-post' },
      { from: '/blog/my-post-two.php', path: '/blog/my-post-two.php', to: '/blog/my-post-two' },
    ],
  ],
  [
    'multiple_lines',
    { redirectsFiles: ['multiple_lines'] },
    [
      { from: '/10thmagnitude', path: '/10thmagnitude', to: 'http://www.10thmagnitude.com/', status: 301 },
      { from: '/bananastand', path: '/bananastand', to: 'http://eepurl.com/Lgde5', status: 301 },
    ],
  ],
  ['line_trim', { redirectsFiles: ['line_trim'] }, [{ from: '/home', path: '/home', to: '/' }]],
  [
    'comment_full',
    { redirectsFiles: ['comment_full'] },
    [{ from: '/blog/my-post.php', path: '/blog/my-post.php', to: '/blog/my-post' }],
  ],
  [
    'comment_inline',
    { redirectsFiles: ['comment_inline'] },
    [{ from: '/blog/my-post.php', path: '/blog/my-post.php', to: '/blog/my-post' }],
  ],
  ['from_simple', { redirectsFiles: ['from_simple'] }, [{ from: '/home', path: '/home', to: '/' }]],
  [
    'from_absolute_uri',
    { redirectsFiles: ['from_absolute_uri'] },
    [
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
    'query',
    { redirectsFiles: ['query'] },
    [
      { from: '/', path: '/', to: '/news', query: { page: 'news' } },
      { from: '/blog', path: '/blog', to: '/blog/:post_id', query: { post: ':post_id' } },
      { from: '/', path: '/', to: '/about', query: { _escaped_fragment_: '/about' } },
    ],
  ],
  [
    'to_anchor',
    { redirectsFiles: ['to_anchor'] },
    [{ from: '/blog/my-post-ads.php', path: '/blog/my-post-ads.php', to: '/blog/my-post#ads' }],
  ],
  [
    'to_splat_no_force',
    { redirectsFiles: ['to_splat_no_force'] },
    [{ from: '/*', path: '/*', to: 'https://www.bitballoon.com/:splat', status: 301 }],
  ],
  [
    'to_splat_force',
    { redirectsFiles: ['to_splat_force'] },
    [{ from: '/*', path: '/*', to: 'https://www.bitballoon.com/:splat', status: 301, force: true }],
  ],
  [
    'to_path_forward',
    { redirectsFiles: ['to_path_forward'] },
    [
      { from: '/admin/*', path: '/admin/*', to: '/admin/:splat', status: 200 },
      { from: '/admin/*', path: '/admin/*', to: '/admin/:splat', status: 200, force: true },
    ],
  ],
  [
    'proxy',
    { redirectsFiles: ['proxy'] },
    [{ from: '/api/*', path: '/api/*', to: 'https://api.bitballoon.com/*', status: 200, proxy: true }],
  ],
  [
    'status',
    { redirectsFiles: ['status'] },
    [{ from: '/test', path: '/test', to: 'https://www.bitballoon.com/test=hello', status: 301 }],
  ],
  [
    'status_force',
    { redirectsFiles: ['status_force'] },
    [{ from: '/test', path: '/test', to: 'https://www.bitballoon.com/test=hello', status: 301, force: true }],
  ],
  [
    'conditions_country',
    { redirectsFiles: ['conditions_country'] },
    [{ from: '/', path: '/', to: '/china', status: 302, conditions: { Country: ['ch', 'tw'] } }],
  ],
  [
    'conditions_country_language',
    { redirectsFiles: ['conditions_country_language'] },
    [{ from: '/', path: '/', to: '/china', status: 302, conditions: { Country: ['il'], Language: ['en'] } }],
  ],
  [
    'conditions_role',
    { redirectsFiles: ['conditions_role'] },
    [{ from: '/admin/*', path: '/admin/*', to: '/admin/:splat', status: 200, conditions: { Role: ['admin'] } }],
  ],
  [
    'conditions_roles',
    { redirectsFiles: ['conditions_roles'] },
    [
      {
        from: '/member/*',
        path: '/member/*',
        to: '/member/:splat',
        status: 200,
        conditions: { Role: ['admin', 'member'] },
      },
    ],
  ],
  [
    'conditions_query',
    { redirectsFiles: ['conditions_query'] },
    [
      {
        from: '/donate',
        path: '/donate',
        to: '/donate/usa?source=:source&email=:email',
        status: 302,
        query: { source: ':source', email: ':email' },
        conditions: { Country: ['us'] },
      },
    ],
  ],
  [
    'conditions_country_case',
    { redirectsFiles: ['conditions_country_case'] },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', status: 200, conditions: { Country: ['US'] } }],
  ],
  [
    'conditions_language_case',
    { redirectsFiles: ['conditions_language_case'] },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', status: 200, conditions: { Language: ['en'] } }],
  ],
  [
    'conditions_role_case',
    { redirectsFiles: ['conditions_role_case'] },
    [{ from: '/old-path', path: '/old-path', to: '/new-path', status: 200, conditions: { Role: ['admin'] } }],
  ],
  [
    'signed',
    { redirectsFiles: ['signed'] },
    [
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
  ],
  [
    'signed_backward_compat',
    { redirectsFiles: ['signed_backward_compat'] },
    [
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
  ],
])(`Parses _redirects | %s`, async (_, input, output) => {
  const { redirects } = await parseRedirects(input)
  const normalized = output.map((redirect) => normalizeRedirect(redirect, input))
  expect(redirects).toStrictEqual(normalized)
})

test.each([
  ['invalid_dir', { redirectsFiles: ['invalid_dir'] }, /read redirects file/],
  ['invalid_url', { redirectsFiles: ['invalid_url'] }, /Invalid URL/],
  ['invalid_dot_netlify_url', { redirectsFiles: ['invalid_dot_netlify_url'] }, /must not start/],
  ['invalid_dot_netlify_path', { redirectsFiles: ['invalid_dot_netlify_path'] }, /must not start/],
  ['invalid_status', { redirectsFiles: ['invalid_status'] }, /Invalid status code/],
  ['invalid_no_to_no_status', { redirectsFiles: ['invalid_no_to_no_status'] }, /Missing destination/],
  ['invalid_no_to_status', { redirectsFiles: ['invalid_no_to_status'] }, /Missing "to" field/],
  ['invalid_no_to_query', { redirectsFiles: ['invalid_no_to_query'] }, /must start with/],
  ['invalid_no_slash', { redirectsFiles: ['invalid_no_slash'] }, /must start with/],
  ['invalid_mistaken_headers', { redirectsFiles: ['invalid_mistaken_headers'] }, /Missing destination/],
])(`Validate syntax errors | %s`, async (_, input, errorMessage) => {
  const { errors } = await parseRedirects(input)
  expect(errors).not.toHaveLength(0)
  expect(errors.some((error) => errorMessage.test(error.message))).toBeTruthy()
})
