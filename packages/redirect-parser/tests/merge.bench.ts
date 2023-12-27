import { expect, bench } from 'vitest'

import { parseRedirects } from './helpers/main.js'

// Tinybench dropped support for Node 14 recently
// https://github.com/tinylibs/tinybench/pull/40 and
// https://github.com/tinylibs/tinybench/pull/43
// This is just a quick workaround to not run the bench tests in node 14 while we still support it
if (!process.version.startsWith('14')) {
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
}
