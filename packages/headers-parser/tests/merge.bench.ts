import { expect, bench } from 'vitest'

import { parseHeaders } from './helpers/main.js'

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
