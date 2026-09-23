import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

type EnvEntry = { sources: string[]; value: string }
type Result = { env: Record<string, EnvEntry | undefined> }

const CACHED_ENV = {
  INTERNAL_VAR: { sources: ['internal'], value: 'internal value' },
  LANG: { sources: ['internal'], value: 'internal value' },
  TEST: { sources: ['internal'], value: 'internal value' },
  UI_VAR: { sources: ['ui'], value: 'ui value' },
}

// A cached config is returned as-is unless a `defaultConfig` is also given, as netlify-cli does.
const resolveWithCachedEnv = async (fixtureName: string) =>
  (await new Fixture(import.meta.url, `./fixtures/${fixtureName}`)
    .withFlags({ cachedConfig: { env: CACHED_ENV }, defaultConfig: {} })
    .runWithConfigAsObject()) as Result

test('Keeps the variables a cached config marks as internal', async () => {
  const { env } = await resolveWithCachedEnv('empty')

  expect(env.INTERNAL_VAR).toEqual({ sources: ['internal'], value: 'internal value' })
  expect(env.UI_VAR).toBeUndefined()
})

test('Internal variables have the lowest precedence', async () => {
  const { env } = await resolveWithCachedEnv('file_env')

  expect(env.TEST).toEqual({ sources: ['configFile', 'internal'], value: 'testFile' })
  expect(env.LANG).toEqual({ sources: ['general', 'internal'], value: 'en_US.UTF-8' })
})

const SITE_INFO_WITH_ENVELOPE = {
  path: '/api/v1/sites/test',
  response: {
    account_id: 'team',
    account_slug: 'team',
    build_settings: { env: { UI_ENV_VAR: 'from build settings' } },
    id: 'test',
    ssl_url: 'test',
    use_envelope: true,
  },
}

test('Ignores a failure to fetch environment variables from the API', async () => {
  const { env } = (await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServerAsObject([
      SITE_INFO_WITH_ENVELOPE,
      { path: '/api/v1/accounts/team/env?context_name=production&site_id=test', status: 500, response: {} },
      { path: '/api/v1/accounts/team/env?context_name=production', status: 500, response: {} },
      { path: '/site/test/integrations/safe', response: [] },
    ])) as Result

  expect(env.URL).toEqual({ sources: ['general'], value: 'test' })
  expect(env.UI_ENV_VAR).toBeUndefined()
})
