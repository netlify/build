import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

// List of API endpoints to mock
const SITE_INFO_PATH = '/api/v1/sites/test'
const LIST_ACCOUNTS_PATH = '/api/v1/accounts'
const TEAM_ENVELOPE_PATH = '/api/v1/accounts/team/env?context_name=production'
const SITE_ENVELOPE_PATH = '/api/v1/accounts/team/env?context_name=production&site_id=test'

// List of API mock URLs, responses and status codes
const SITE_INFO_RESPONSE_URL = {
  path: SITE_INFO_PATH,
  response: { ssl_url: 'test' },
}
const SITE_INFO_RESPONSE_NAME = {
  path: SITE_INFO_PATH,
  response: { name: 'test-name' },
}
const SITE_INFO_RESPONSE_REPO_URL = {
  path: SITE_INFO_PATH,
  response: { build_settings: { repo_url: 'test' } },
}
const SITE_INFO_RESPONSE_ENV = {
  path: SITE_INFO_PATH,
  response: { build_settings: { env: { TEST: 'test' } } },
}
const SITE_INFO_RESPONSE_ERROR = {
  path: SITE_INFO_PATH,
  status: 500,
}
const SITE_INFO_RESPONSE_ACCOUNT = {
  path: SITE_INFO_PATH,
  response: { account_slug: 'testAccount' },
}
const LIST_ACCOUNTS_RESPONSE_SUCCESS = [
  SITE_INFO_RESPONSE_ACCOUNT,
  {
    path: LIST_ACCOUNTS_PATH,
    response: [{ slug: 'testAccount', site_env: { TEST: 'test' } }],
  },
]
const LIST_ACCOUNTS_RESPONSE_MISMATCH = {
  path: LIST_ACCOUNTS_PATH,
  response: [{ slug: 'testAccount', site_env: { TEST: 'test' } }],
}
const LIST_ACCOUNTS_RESPONSE_ERROR = [
  SITE_INFO_RESPONSE_ACCOUNT,
  {
    path: LIST_ACCOUNTS_PATH,
    status: 500,
  },
]
const LIST_ACCOUNTS_RESPONSE_WRONG_SHAPE = [
  SITE_INFO_RESPONSE_ACCOUNT,
  {
    path: LIST_ACCOUNTS_PATH,
    response: {},
  },
]
const SITE_INFO_WITH_ENVELOPE = {
  path: SITE_INFO_PATH,
  response: {
    account_id: 'team',
    account_slug: 'team',
    build_settings: {
      env: { MONGO_ENV_VAR: 'should_not_be_defined' },
    },
    id: 'test',
    ssl_url: 'test',
    use_envelope: true,
  },
}
const TEAM_ENVELOPE_RESPONSE = {
  path: TEAM_ENVELOPE_PATH,
  response: [
    {
      key: 'SHARED_ENV_VAR',
      scopes: ['build'],
      values: [
        {
          context: 'all',
          value: 'ENVELOPE_TEAM_ALL',
        },
      ],
    },
  ],
}
const SITE_ENVELOPE_RESPONSE = {
  path: SITE_ENVELOPE_PATH,
  response: [
    {
      key: 'SITE_ENV_VAR',
      scopes: ['functions'],
      values: [
        {
          context: 'dev',
          value: 'ENVELOPE_SITE_DEV',
        },
        {
          context: 'production',
          value: 'ENVELOPE_SITE_PROD',
        },
      ],
    },
  ],
}
const SITE_EXTENSIONS_EMPTY_RESPONSE = {
  path: '/site/test/integrations/safe',
  response: [],
}

// List of authenticating-related CLI flags
const AUTH_FLAGS = { token: 'test', siteId: 'test' }
const AUTH_FLAGS_NO_SITE_ID = { token: 'test' }
const AUTH_FLAGS_NO_TOKEN = { siteId: 'test' }
const AUTH_FLAGS_BUILDBOT = { token: 'test', siteId: 'test', mode: 'buildbot' }
const AUTH_FLAGS_OFFLINE = { token: 'test', siteId: 'test', offline: true }

const isDefinedString = function (string) {
  return typeof string === 'string' && string.trim().length !== 0
}

test('Does not set environment variable in the buildbot', async () => {
  const { env } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ mode: 'buildbot' })
    .runWithConfigAsObject()
  expect(Object.keys(env)).toHaveLength(0)
})

test('Sets LANG environment variable', async () => {
  const {
    env: { LANG },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(LANG.sources).toEqual(['general'])
  expect(isDefinedString(LANG.value)).toBe(true)
})

test('Sets LANGUAGE environment variable', async () => {
  const {
    env: { LANGUAGE },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(LANGUAGE.sources).toEqual(['general'])
  expect(isDefinedString(LANGUAGE.value)).toBe(true)
})

test('Sets LC_ALL environment variable', async () => {
  const {
    env: { LC_ALL },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(LC_ALL.sources).toEqual(['general'])
  expect(isDefinedString(LC_ALL.value)).toBe(true)
})

test('Sets GATSBY_TELEMETRY_DISABLED environment variable', async () => {
  const {
    env: { GATSBY_TELEMETRY_DISABLED },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(GATSBY_TELEMETRY_DISABLED.sources).toEqual(['general'])
  expect(isDefinedString(GATSBY_TELEMETRY_DISABLED.value)).toBe(true)
})

test('Sets NEXT_TELEMETRY_DISABLED environment variable', async () => {
  const {
    env: { NEXT_TELEMETRY_DISABLED },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(NEXT_TELEMETRY_DISABLED.sources).toEqual(['general'])
  expect(isDefinedString(NEXT_TELEMETRY_DISABLED.value)).toBe(true)
})

test('Sets PULL_REQUEST environment variable', async () => {
  const {
    env: { PULL_REQUEST },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(PULL_REQUEST.sources).toEqual(['general'])
  expect(isDefinedString(PULL_REQUEST.value)).toBe(true)
})

test('Sets COMMIT_REF environment variable', async () => {
  const {
    env: { COMMIT_REF },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(COMMIT_REF.sources).toEqual(['general'])
  expect(isDefinedString(COMMIT_REF.value)).toBe(true)
})

test('Sets CACHED_COMMIT_REF environment variable', async () => {
  const {
    env: { CACHED_COMMIT_REF },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(CACHED_COMMIT_REF.sources).toEqual(['general'])
  expect(isDefinedString(CACHED_COMMIT_REF.value)).toBe(true)
})

test('Sets HEAD environment variable', async () => {
  const {
    env: { HEAD },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(HEAD.sources).toEqual(['general'])
  expect(isDefinedString(HEAD.value)).toBe(true)
})

test('Sets BRANCH environment variable', async () => {
  const {
    env: { BRANCH },
  } = await new Fixture(import.meta.url, './fixtures/empty').withFlags({ branch: 'test' }).runWithConfigAsObject()
  expect(BRANCH.sources).toEqual(['general'])
  expect(BRANCH.value).toBe('test')
})

test('Does not set some git-related environment variables if no repository', async () => {
  const {
    env: { COMMIT_REF },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithConfigAsObject())
  expect(COMMIT_REF).toBeUndefined()
})

test('Sets CONTEXT environment variable', async () => {
  const {
    env: { CONTEXT },
  } = await new Fixture(import.meta.url, './fixtures/empty').withFlags({ context: 'test' }).runWithConfigAsObject()
  expect(CONTEXT.sources).toEqual(['general'])
  expect(CONTEXT.value).toBe('test')
})

test('Sets DEPLOY_ID environment variable', async () => {
  const {
    env: { DEPLOY_ID },
  } = await new Fixture(import.meta.url, './fixtures/empty').withFlags({ deployId: 'test' }).runWithConfigAsObject()
  expect(DEPLOY_ID.sources).toEqual(['general'])
  expect(DEPLOY_ID.value).toBe('test')
})

test('Sets default DEPLOY_ID environment variable', async () => {
  const {
    env: { DEPLOY_ID },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(DEPLOY_ID.sources).toEqual(['general'])
  expect(DEPLOY_ID.value).toBe('0')
})

test('Sets BUILD_ID environment variable', async () => {
  const {
    env: { BUILD_ID },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ buildId: 'test-build' })
    .runWithConfigAsObject()
  expect(BUILD_ID.sources).toEqual(['general'])
  expect(BUILD_ID.value).toBe('test-build')
})

test('Sets default BUILD_ID environment variable', async () => {
  const {
    env: { BUILD_ID },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(BUILD_ID.sources).toEqual(['general'])
  expect(BUILD_ID.value).toBe('0')
})

test('Sets NETLIFY_SKEW_PROTECTION_TOKEN environment variable', async () => {
  const {
    env: { NETLIFY_SKEW_PROTECTION_TOKEN },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ skewProtectionToken: 'test-token' })
    .runWithConfigAsObject()
  expect(NETLIFY_SKEW_PROTECTION_TOKEN.sources).toEqual(['general'])
  expect(NETLIFY_SKEW_PROTECTION_TOKEN.value).toBe('test-token')
})

test('Does not set NETLIFY_SKEW_PROTECTION_TOKEN environment variable if no flag is provided', async () => {
  const {
    env: { NETLIFY_SKEW_PROTECTION_TOKEN },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(NETLIFY_SKEW_PROTECTION_TOKEN).toBeUndefined()
})

test('Sets SITE_ID environment variable', async () => {
  const {
    env: { SITE_ID },
  } = await new Fixture(import.meta.url, './fixtures/empty').withFlags({ siteId: 'test' }).runWithConfigAsObject()
  expect(SITE_ID.sources).toEqual(['general'])
  expect(SITE_ID.value).toBe('test')
})

test('Does not set SITE_ID environment variable if no flag is provided', async () => {
  const {
    env: { SITE_ID },
  } = await new Fixture(import.meta.url, './fixtures/empty').runWithConfigAsObject()
  expect(SITE_ID).toBeUndefined()
})

test('Sets SITE_NAME environment variable', async () => {
  const {
    env: { SITE_NAME },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_NAME, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(SITE_NAME.sources).toEqual(['general'])
  expect(SITE_NAME.value).toBe('test-name')
})

test('Does not set SITE_NAME environment variable if offline', async () => {
  const {
    env: { SITE_NAME },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS_OFFLINE)
    .runConfigServerAsObject(SITE_INFO_RESPONSE_ENV)
  expect(SITE_NAME).toBeUndefined()
})

test('Sets URL environment variable', async () => {
  const {
    env: { URL },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_URL, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(URL.sources).toEqual(['general'])
  expect(URL.value).toBe('test')
})

test('Sets environment variables when configured to use Envelope', async () => {
  const { env } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([
      SITE_INFO_WITH_ENVELOPE,
      SITE_ENVELOPE_RESPONSE,
      TEAM_ENVELOPE_RESPONSE,
      SITE_EXTENSIONS_EMPTY_RESPONSE,
    ])
  expect(env.URL.sources).toEqual(['general'])
  expect(env.URL.value).toBe('test')
  expect(env.SHARED_ENV_VAR.value).toBe('ENVELOPE_TEAM_ALL')
  expect(env.SITE_ENV_VAR.value).toBe('ENVELOPE_SITE_PROD')
  expect(env.MONGO_ENV_VAR).toBeUndefined()
})

test('Sets REPOSITORY_URL environment variable', async () => {
  const {
    env: { REPOSITORY_URL },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_REPO_URL, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(REPOSITORY_URL.sources).toEqual(['general'])
  expect(REPOSITORY_URL.value).toBe('test')
})

test('Sets DEPLOY_URL environment variable', async () => {
  const {
    env: { DEPLOY_URL },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ ...AUTH_FLAGS, deployId: 'test' })
    .runConfigServerAsObject([SITE_INFO_RESPONSE_NAME, SITE_EXTENSIONS_EMPTY_RESPONSE])

  expect(DEPLOY_URL.sources).toEqual(['general'])
  expect(DEPLOY_URL.value).toBe(`https://test--test-name.netlify.app`)
})

test('Sets DEPLOY_PRIME_URL environment variable', async () => {
  const {
    env: { DEPLOY_PRIME_URL },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ ...AUTH_FLAGS, branch: 'test' })
    .runConfigServerAsObject([SITE_INFO_RESPONSE_NAME, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(DEPLOY_PRIME_URL.sources).toEqual(['general'])
  expect(DEPLOY_PRIME_URL.value).toBe(`https://test--test-name.netlify.app`)
})

test('Does not set NETLIFY_LOCAL environment variable in production', async () => {
  const {
    env: { NETLIFY_LOCAL },
  } = await new Fixture(import.meta.url, './fixtures/empty').withFlags({ mode: 'buildbot' }).runWithConfigAsObject()
  expect(NETLIFY_LOCAL).toBeUndefined()
})

test('Sets NETLIFY_LOCAL environment variable in CLI builds', async () => {
  const {
    env: { NETLIFY_LOCAL },
  } = await new Fixture(import.meta.url, './fixtures/empty').withFlags({ mode: 'cli' }).runWithConfigAsObject()
  expect(NETLIFY_LOCAL.value).toBe('true')
})

test('Sets NETLIFY_LOCAL environment variable in programmatic builds', async () => {
  const {
    env: { NETLIFY_LOCAL },
  } = await new Fixture(import.meta.url, './fixtures/empty').withFlags({ mode: 'require' }).runWithConfigAsObject()
  expect(NETLIFY_LOCAL.value).toBe('true')
})

test('Sets config file environment variables', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/file_env').runWithConfigAsObject()
  expect(TEST.sources).toEqual(['configFile'])
  expect(TEST.value).toBe('testFile')
})

test('Sets config file empty environment variables', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/file_env_empty').runWithConfigAsObject()
  expect(TEST.sources).toEqual(['configFile'])
  expect(TEST.value).toBe('')
})

test('Coerces environment variables to string', async () => {
  const {
    env: { NETLIFY_NEXT_SKIP_PLUGIN, PYTHON_VERSION },
  } = await new Fixture(import.meta.url, './fixtures/file_env_not_string').runWithConfigAsObject()

  expect(PYTHON_VERSION.value).toBe('3.9')
  expect(NETLIFY_NEXT_SKIP_PLUGIN.value).toBe('true')
})

test('Merges all environment variables', async () => {
  const {
    env: { TEST, LANG },
  } = await new Fixture(import.meta.url, './fixtures/file_env')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_ENV, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(TEST.sources).toEqual(['configFile', 'ui'])
  expect(TEST.value).toBe('testFile')
  expect(LANG.sources).toEqual(['general'])
  expect(isDefinedString(LANG.value)).toBe(true)
})

test('Sets site environment variables', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_ENV, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(TEST.sources).toEqual(['ui'])
  expect(TEST.value).toBe('test')
})

test('Does not set site environment variables on API error', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServer(SITE_INFO_RESPONSE_ERROR)
  expect(isDefinedString(output)).toBe(true)
})

test('Does not set site environment variables in the buildbot', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS_BUILDBOT)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_ENV, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(TEST).toBeUndefined()
})

test('Does not set site environment variables if offline', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS_OFFLINE)
    .runConfigServerAsObject(SITE_INFO_RESPONSE_ENV)
  expect(TEST).toBeUndefined()
})

test('Does not set site environment variables without a siteId', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS_NO_SITE_ID)
    .runConfigServerAsObject(SITE_INFO_RESPONSE_ENV)
  expect(TEST).toBeUndefined()
})

test('Does not set site environment variables without a token', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS_NO_TOKEN)
    .runConfigServerAsObject(SITE_INFO_RESPONSE_ENV)
  expect(TEST).toBeUndefined()
})

test('Sets accounts environment variables', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([...LIST_ACCOUNTS_RESPONSE_SUCCESS, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(TEST.sources).toEqual(['account'])
  expect(TEST.value).toBe('test')
})

test('Does not set accounts environment variables if no matching account', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([LIST_ACCOUNTS_RESPONSE_MISMATCH, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(TEST).toBeUndefined()
})

test('Does not set accounts environment variables on API error', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServer(LIST_ACCOUNTS_RESPONSE_ERROR)
  expect(isDefinedString(output)).toBe(true)
})

test('Does not set accounts environment variables on API wrong response shape', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([LIST_ACCOUNTS_RESPONSE_WRONG_SHAPE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(TEST).toBeUndefined()
})

test('Does not set accounts environment variables in the buildbot', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS_BUILDBOT)
    .runConfigServerAsObject([LIST_ACCOUNTS_RESPONSE_SUCCESS, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(TEST).toBeUndefined()
})

test('Does not set accounts environment variables if offline', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS_OFFLINE)
    .runConfigServerAsObject(LIST_ACCOUNTS_RESPONSE_SUCCESS)
  expect(TEST).toBeUndefined()
})

test('Does not set accounts environment variables without a siteId', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS_NO_SITE_ID)
    .runConfigServerAsObject(LIST_ACCOUNTS_RESPONSE_SUCCESS)
  expect(TEST).toBeUndefined()
})

test('Does not set accounts environment variables without a token', async () => {
  const {
    env: { TEST },
  } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags(AUTH_FLAGS_NO_TOKEN)
    .runConfigServerAsObject(LIST_ACCOUNTS_RESPONSE_SUCCESS)
  expect(TEST).toBeUndefined()
})

test('Does not allow overridding readonly environment variables', async () => {
  const {
    env: { REVIEW_ID },
  } = await new Fixture(import.meta.url, './fixtures/readonly').runWithConfigAsObject()
  expect(REVIEW_ID).toBeUndefined()
})
