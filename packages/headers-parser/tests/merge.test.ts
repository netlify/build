import { expect, test } from 'vitest'

import { parseHeaders } from './helpers/main.js'

test.each([
  ['empty', {}, []],
  ['file_only', { headersFiles: ['success'], configHeaders: [] }, [{ for: '/path', values: { test: 'one' } }]],
  [
    'config_only',
    { configHeaders: [{ for: '/pathTwo', values: { testTwo: 'two' } }] },
    [{ for: '/pathTwo', values: { testTwo: 'two' } }],
  ],
  [
    'both',
    { headersFiles: ['success'], configHeaders: [{ for: '/pathTwo', values: { testTwo: 'two' } }] },
    [
      { for: '/path', values: { test: 'one' } },
      { for: '/pathTwo', values: { testTwo: 'two' } },
    ],
  ],
  [
    'both_same_path',
    { headersFiles: ['success'], configHeaders: [{ for: '/path', values: { testTwo: 'two' } }] },
    [
      { for: '/path', values: { test: 'one' } },
      { for: '/path', values: { testTwo: 'two' } },
    ],
  ],
  [
    'both_same_path_value',
    { headersFiles: ['success'], configHeaders: [{ for: '/path', values: { test: 'two' } }] },
    [
      { for: '/path', values: { test: 'one' } },
      { for: '/path', values: { test: 'two' } },
    ],
  ],
])(`Merges _headers with netlify.toml headers | %s`, async (_, input, output) => {
  const { headers } = await parseHeaders({
    headersFiles: undefined,
    configHeaders: undefined,
    netlifyConfigPath: undefined,
    minimal: true,
    ...input,
  })
  expect(headers).toStrictEqual(output)
})
