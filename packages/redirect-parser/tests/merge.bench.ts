import { expect, bench } from 'vitest'

import { parseRedirects } from './helpers/main.js'

bench('Merges large _redirects file with config redirects', async () => {
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
  expect(errors).toHaveLength(0)
  expect(redirects).length.to.be.greaterThan(0)
})
