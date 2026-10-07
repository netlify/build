import { resolveConfig } from '@netlify/config'
import { Fixture, startServer } from '@netlify/testing'
import { expect, test } from 'vitest'

const SITE_RESPONSE = { path: '/api/v1/sites/test', response: { name: 'api-name' } }
const ACCOUNTS_RESPONSE = { path: '/api/v1/accounts', response: [{ slug: 'api-account' }] }
const EXTENSIONS_RESPONSE = {
  path: '/site/test/integrations/safe',
  response: [
    { author: '', extension_token: '', has_build: false, name: 'api-extension', slug: 'api-extension', version: '' },
  ],
}
const SITE_DATA_PATHS = [SITE_RESPONSE.path, ACCOUNTS_RESPONSE.path, EXTENSIONS_RESPONSE.path].toSorted()

const CACHED_SITE_INFO = { id: 'test', name: 'cached-name', account_slug: 'cached-account' }
const CACHED_ACCOUNTS = [{ slug: 'cached-account', site_env: {} }]
const CACHED_INTEGRATIONS = [
  {
    author: '',
    buildPlugin: null,
    extension_token: '',
    has_build: false,
    name: 'cached-extension',
    slug: 'cached-extension',
    version: '',
  },
]

const resolveWithCachedSiteData = async (cachedSiteData: object, featureFlags: Record<string, boolean>) => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfigAsObject()
  const { scheme, host, requests, stopServer } = await startServer([
    SITE_RESPONSE,
    ACCOUNTS_RESPONSE,
    EXTENSIONS_RESPONSE,
  ])
  try {
    const result = await resolveConfig(
      new Fixture(import.meta.url, './fixtures/cached_config')
        .withFlags({
          cachedConfig: { ...cachedConfig, ...cachedSiteData },
          defaultConfig: {},
          siteId: 'test',
          mode: 'dev',
          token: 'test',
          featureFlags,
          testOpts: { scheme, host },
        })
        .getConfigFlags(),
    )
    const requestedPaths = requests.map(({ url }) => new URL(url, 'http://localhost').pathname).toSorted()
    return { ...result, requestedPaths }
  } finally {
    await stopServer()
  }
}

test('With use_cached_site_info, the site data of a cached config is reused without any request', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `resolveConfig`'s result is untyped until its rewrite
  const { siteInfo, accounts, integrations, requestedPaths } = await resolveWithCachedSiteData(
    { siteInfo: CACHED_SITE_INFO, accounts: CACHED_ACCOUNTS, integrations: CACHED_INTEGRATIONS },
    { use_cached_site_info: true },
  )

  expect(requestedPaths).toEqual([])
  expect(siteInfo).toEqual(CACHED_SITE_INFO)
  expect(accounts).toEqual(CACHED_ACCOUNTS)
  expect(integrations).toEqual(CACHED_INTEGRATIONS)
})

test('With use_cached_site_info, the site data is fetched when the cached config lacks some of it', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `resolveConfig`'s result is untyped until its rewrite
  const { siteInfo, accounts, integrations, requestedPaths } = await resolveWithCachedSiteData(
    { siteInfo: CACHED_SITE_INFO, accounts: undefined, integrations: CACHED_INTEGRATIONS },
    { use_cached_site_info: true },
  )

  expect(requestedPaths).toEqual(SITE_DATA_PATHS)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- `resolveConfig`'s result is untyped until its rewrite
  expect(siteInfo.name).toBe('api-name')
  expect(accounts).toEqual([{ slug: 'api-account' }])
  expect(integrations.map(({ slug }) => slug)).toEqual(['api-extension'])
})

test('Without use_cached_site_info, the site data of a cached config is fetched again', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `resolveConfig`'s result is untyped until its rewrite
  const { siteInfo, accounts, integrations, requestedPaths } = await resolveWithCachedSiteData(
    { siteInfo: CACHED_SITE_INFO, accounts: CACHED_ACCOUNTS, integrations: CACHED_INTEGRATIONS },
    {},
  )

  expect(requestedPaths).toEqual(SITE_DATA_PATHS)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- `resolveConfig`'s result is untyped until its rewrite
  expect(siteInfo.name).toBe('api-name')
  expect(accounts).toEqual([{ slug: 'api-account' }])
  expect(integrations.map(({ slug }) => slug)).toEqual(['api-extension'])
})
