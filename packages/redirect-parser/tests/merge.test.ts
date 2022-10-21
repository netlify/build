import { expect, test } from 'vitest'

import { normalizeRedirect, parseRedirects } from './helpers/main.js'

test.each([
  ['undefined', {}, []],
  [
    'empty',
    {
      redirectsFiles: ['empty'],
    },
    [],
  ],
  [
    'simple',
    {
      redirectsFiles: ['simple'],
    },
    [
      {
        from: '/one',
        path: '/one',
        to: '/two',
      },
    ],
  ],
  [
    'only_config',
    {
      redirectsFiles: ['empty'],
      configRedirects: [
        {
          from: '/one',
          to: '/three',
        },
      ],
    },
    [
      {
        from: '/one',
        path: '/one',
        to: '/three',
      },
    ],
  ],
  [
    'simple_merge',
    {
      redirectsFiles: ['simple'],
      configRedirects: [
        {
          from: '/one',
          to: '/three',
        },
      ],
    },
    [
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
  ],
  [
    'simple_multiple',
    {
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
    [
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
  ],
])(`Merges _redirects with netlify.toml redirects | %s`, async (_, input, output) => {
  const { redirects } = await parseRedirects(input)
  const normalized = output.map((redirect) => normalizeRedirect(redirect, input))
  expect(redirects).toStrictEqual(normalized)
})

test('Merges large _redirects file with config redirects', async () => {
  const configRedirects = [
    {
      from: '/base/some-1',
      to: '/base/another-1',
    },
    {
      from: 'from-unique-redirect',
      to: 'to-unique-redirect',
    },
  ]
  const { errors, redirects } = await parseRedirects({
    redirectsFiles: ['large_45000_redirects_file'],
    configRedirects,
  })
  expect(errors).length.to.be.eq(0)
  expect(redirects).length.to.be.greaterThan(45000)
})
