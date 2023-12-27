import { expect, bench } from 'vitest'

import { parseHeaders } from './helpers/main.js'

// Tinybench dropped support for Node 14 recently
// https://github.com/tinylibs/tinybench/pull/40 and
// https://github.com/tinylibs/tinybench/pull/43
// This is just a quick workaround to not run the bench tests in node 14 while we still support it
if (!process.version.startsWith('14')) {
  bench('Merges large _headers file with config headers', async () => {
    const input = {
      headersFiles: ['large_headers_file'],
      configHeaders: [
        { for: '/base/some-1', values: { test: 'some-1' } },
        { for: '/unique-header', values: { test: 'unique-value' } },
      ],
    }
    const { headers, errors } = await parseHeaders(input)
    expect(errors).toHaveLength(0)
    expect(headers).length.to.be.greaterThan(0)
  })
}
