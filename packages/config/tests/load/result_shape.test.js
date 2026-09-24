import { fileURLToPath } from 'url'

import { resolveConfig } from '@netlify/config'
import { expect, test } from 'vitest'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('The result has the same own properties, in the same order, whatever is undefined', async () => {
  const result = await resolveConfig({
    repositoryRoot: `${FIXTURES_DIR}/none`,
    branch: 'branch',
    env: { NETLIFY_AUTH_TOKEN: '' },
  })

  expect(Object.keys(result)).toEqual([
    'siteInfo',
    'integrations',
    'accounts',
    'env',
    'configPath',
    'redirectsPath',
    'headersPath',
    'buildDir',
    'repositoryRoot',
    'config',
    'context',
    'branch',
    'token',
    'api',
    'logs',
  ])
  expect(result.configPath).toBeUndefined()
  expect(result.token).toBeUndefined()
  expect(result.api).toBeUndefined()
  expect(result.logs).toBeUndefined()
})
