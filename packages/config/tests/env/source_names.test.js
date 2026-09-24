import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

test('Each variable lists where it was set, using the exact source names', async () => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/file_env').runWithConfigAsObject()
  const result = await new Fixture(import.meta.url, './fixtures/file_env')
    .withFlags({
      cachedConfig: { ...cachedConfig, env: { INTERNAL_VAR: { sources: ['internal'], value: 'internal value' } } },
      defaultConfig: {},
      token: 'test',
      siteId: 'test',
    })
    .runConfigServerAsObject([
      {
        path: '/api/v1/sites/test',
        response: { account_slug: 'team', build_settings: { env: { UI_VAR: 'ui value' } } },
      },
      { path: '/api/v1/accounts', response: [{ slug: 'team', site_env: { ACCOUNT_VAR: 'account value' } }] },
      { path: '/site/test/integrations/safe', response: [] },
    ])

  expect(result).toHaveProperty(['env', 'TEST'], { sources: ['configFile'], value: 'testFile' })
  expect(result).toHaveProperty(['env', 'UI_VAR'], { sources: ['ui'], value: 'ui value' })
  expect(result).toHaveProperty(['env', 'ACCOUNT_VAR'], { sources: ['account'], value: 'account value' })
  expect(result).toHaveProperty(['env', 'SITE_ID'], { sources: ['general'], value: 'test' })
  expect(result).toHaveProperty(['env', 'INTERNAL_VAR'], { sources: ['internal'], value: 'internal value' })
})
