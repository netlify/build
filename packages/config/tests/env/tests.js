import { Fixture } from '@netlify/testing'
import test from 'ava'

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

test('Does not set environment variable in the buildbot', async (t) => {
  const { env } = await new Fixture('./fixtures/empty').withFlags({ mode: 'buildbot' }).runWithConfigAsObject()
  t.is(Object.keys(env).length, 0)
})

test('Sets LANG environment variable', async (t) => {
  const {
    env: { LANG },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(LANG.sources, ['general'])
  t.true(isDefinedString(LANG.value))
})

test('Sets LANGUAGE environment variable', async (t) => {
  const {
    env: { LANGUAGE },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(LANGUAGE.sources, ['general'])
  t.true(isDefinedString(LANGUAGE.value))
})

test('Sets LC_ALL environment variable', async (t) => {
  const {
    env: { LC_ALL },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(LC_ALL.sources, ['general'])
  t.true(isDefinedString(LC_ALL.value))
})

test('Sets GATSBY_TELEMETRY_DISABLED environment variable', async (t) => {
  const {
    env: { GATSBY_TELEMETRY_DISABLED },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(GATSBY_TELEMETRY_DISABLED.sources, ['general'])
  t.true(isDefinedString(GATSBY_TELEMETRY_DISABLED.value))
})

test('Sets NEXT_TELEMETRY_DISABLED environment variable', async (t) => {
  const {
    env: { NEXT_TELEMETRY_DISABLED },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(NEXT_TELEMETRY_DISABLED.sources, ['general'])
  t.true(isDefinedString(NEXT_TELEMETRY_DISABLED.value))
})

test('Sets PULL_REQUEST environment variable', async (t) => {
  const {
    env: { PULL_REQUEST },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(PULL_REQUEST.sources, ['general'])
  t.true(isDefinedString(PULL_REQUEST.value))
})

test('Sets COMMIT_REF environment variable', async (t) => {
  const {
    env: { COMMIT_REF },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(COMMIT_REF.sources, ['general'])
  t.true(isDefinedString(COMMIT_REF.value))
})

test('Sets CACHED_COMMIT_REF environment variable', async (t) => {
  const {
    env: { CACHED_COMMIT_REF },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(CACHED_COMMIT_REF.sources, ['general'])
  t.true(isDefinedString(CACHED_COMMIT_REF.value))
})

test('Sets HEAD environment variable', async (t) => {
  const {
    env: { HEAD },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(HEAD.sources, ['general'])
  t.true(isDefinedString(HEAD.value))
})

test('Sets BRANCH environment variable', async (t) => {
  const {
    env: { BRANCH },
  } = await new Fixture('./fixtures/empty').withFlags({ branch: 'test' }).runWithConfigAsObject()
  t.deepEqual(BRANCH.sources, ['general'])
  t.is(BRANCH.value, 'test')
})

test('Does not set some git-related environment variables if no repository', async (t) => {
  const {
    env: { COMMIT_REF },
  } = await new Fixture('./fixtures/empty')
    .withCopyRoot({ git: false })
    .then((fixture) => fixture.runWithConfigAsObject())
  t.is(COMMIT_REF, undefined)
})

test('Sets CONTEXT environment variable', async (t) => {
  const {
    env: { CONTEXT },
  } = await new Fixture('./fixtures/empty').withFlags({ context: 'test' }).runWithConfigAsObject()
  t.deepEqual(CONTEXT.sources, ['general'])
  t.is(CONTEXT.value, 'test')
})

test('Sets DEPLOY_ID environment variable', async (t) => {
  const {
    env: { DEPLOY_ID },
  } = await new Fixture('./fixtures/empty').withFlags({ deployId: 'test' }).runWithConfigAsObject()
  t.deepEqual(DEPLOY_ID.sources, ['general'])
  t.is(DEPLOY_ID.value, 'test')
})

test('Sets default DEPLOY_ID environment variable', async (t) => {
  const {
    env: { DEPLOY_ID },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(DEPLOY_ID.sources, ['general'])
  t.is(DEPLOY_ID.value, '0')
})

test('Sets BUILD_ID environment variable', async (t) => {
  const {
    env: { BUILD_ID },
  } = await new Fixture('./fixtures/empty').withFlags({ buildId: 'test-build' }).runWithConfigAsObject()
  t.deepEqual(BUILD_ID.sources, ['general'])
  t.is(BUILD_ID.value, 'test-build')
})

test('Sets default BUILD_ID environment variable', async (t) => {
  const {
    env: { BUILD_ID },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.deepEqual(BUILD_ID.sources, ['general'])
  t.is(BUILD_ID.value, '0')
})

test('Sets NETLIFY_SKEW_PROTECTION_TOKEN environment variable', async (t) => {
  const {
    env: { NETLIFY_SKEW_PROTECTION_TOKEN },
  } = await new Fixture('./fixtures/empty').withFlags({ skewProtectionToken: 'test-token' }).runWithConfigAsObject()
  t.deepEqual(NETLIFY_SKEW_PROTECTION_TOKEN.sources, ['general'])
  t.is(NETLIFY_SKEW_PROTECTION_TOKEN.value, 'test-token')
})

test('Does not set NETLIFY_SKEW_PROTECTION_TOKEN environment variable if no flag is provided', async (t) => {
  const {
    env: { NETLIFY_SKEW_PROTECTION_TOKEN },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.is(NETLIFY_SKEW_PROTECTION_TOKEN, undefined)
})

test('Sets SITE_ID environment variable', async (t) => {
  const {
    env: { SITE_ID },
  } = await new Fixture('./fixtures/empty').withFlags({ siteId: 'test' }).runWithConfigAsObject()
  t.deepEqual(SITE_ID.sources, ['general'])
  t.is(SITE_ID.value, 'test')
})

test('Does not set SITE_ID environment variable if no flag is provided', async (t) => {
  const {
    env: { SITE_ID },
  } = await new Fixture('./fixtures/empty').runWithConfigAsObject()
  t.is(SITE_ID, undefined)
})

test('Sets SITE_NAME environment variable', async (t) => {
  const {
    env: { SITE_NAME },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_NAME, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.deepEqual(SITE_NAME.sources, ['general'])
  t.is(SITE_NAME.value, 'test-name')
})

test('Does not set SITE_NAME environment variable if offline', async (t) => {
  const {
    env: { SITE_NAME },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS_OFFLINE)
    .runConfigServerAsObject(SITE_INFO_RESPONSE_ENV)
  t.is(SITE_NAME, undefined)
})

test('Sets URL environment variable', async (t) => {
  const {
    env: { URL },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_URL, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.deepEqual(URL.sources, ['general'])
  t.is(URL.value, 'test')
})

test('Sets environment variables when configured to use Envelope', async (t) => {
  const { env } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([
      SITE_INFO_WITH_ENVELOPE,
      SITE_ENVELOPE_RESPONSE,
      TEAM_ENVELOPE_RESPONSE,
      SITE_EXTENSIONS_EMPTY_RESPONSE,
    ])
  t.deepEqual(env.URL.sources, ['general'])
  t.is(env.URL.value, 'test')
  t.is(env.SHARED_ENV_VAR.value, 'ENVELOPE_TEAM_ALL')
  t.is(env.SITE_ENV_VAR.value, 'ENVELOPE_SITE_PROD')
  t.is(env.MONGO_ENV_VAR, undefined)
})

test('Sets REPOSITORY_URL environment variable', async (t) => {
  const {
    env: { REPOSITORY_URL },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_REPO_URL, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.deepEqual(REPOSITORY_URL.sources, ['general'])
  t.is(REPOSITORY_URL.value, 'test')
})

test('Sets DEPLOY_URL environment variable', async (t) => {
  const {
    env: { DEPLOY_URL },
  } = await new Fixture('./fixtures/empty')
    .withFlags({ ...AUTH_FLAGS, deployId: 'test' })
    .runConfigServerAsObject([SITE_INFO_RESPONSE_NAME, SITE_EXTENSIONS_EMPTY_RESPONSE])

  t.deepEqual(DEPLOY_URL.sources, ['general'])
  t.is(DEPLOY_URL.value, `https://test--test-name.netlify.app`)
})

test('Sets DEPLOY_PRIME_URL environment variable', async (t) => {
  const {
    env: { DEPLOY_PRIME_URL },
  } = await new Fixture('./fixtures/empty')
    .withFlags({ ...AUTH_FLAGS, branch: 'test' })
    .runConfigServerAsObject([SITE_INFO_RESPONSE_NAME, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.deepEqual(DEPLOY_PRIME_URL.sources, ['general'])
  t.is(DEPLOY_PRIME_URL.value, `https://test--test-name.netlify.app`)
})

test('Does not set NETLIFY_LOCAL environment variable in production', async (t) => {
  const {
    env: { NETLIFY_LOCAL },
  } = await new Fixture('./fixtures/empty').withFlags({ mode: 'buildbot' }).runWithConfigAsObject()
  t.is(NETLIFY_LOCAL, undefined)
})

test('Sets NETLIFY_LOCAL environment variable in CLI builds', async (t) => {
  const {
    env: { NETLIFY_LOCAL },
  } = await new Fixture('./fixtures/empty').withFlags({ mode: 'cli' }).runWithConfigAsObject()
  t.is(NETLIFY_LOCAL.value, 'true')
})

test('Sets NETLIFY_LOCAL environment variable in programmatic builds', async (t) => {
  const {
    env: { NETLIFY_LOCAL },
  } = await new Fixture('./fixtures/empty').withFlags({ mode: 'require' }).runWithConfigAsObject()
  t.is(NETLIFY_LOCAL.value, 'true')
})

test('Sets config file environment variables', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/file_env').runWithConfigAsObject()
  t.deepEqual(TEST.sources, ['configFile'])
  t.is(TEST.value, 'testFile')
})

test('Sets config file empty environment variables', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/file_env_empty').runWithConfigAsObject()
  t.deepEqual(TEST.sources, ['configFile'])
  t.is(TEST.value, '')
})

test('Coerces environment variables to string', async (t) => {
  const {
    env: { NETLIFY_NEXT_SKIP_PLUGIN, PYTHON_VERSION },
  } = await new Fixture('./fixtures/file_env_not_string').runWithConfigAsObject()

  t.is(PYTHON_VERSION.value, '3.9')
  t.is(NETLIFY_NEXT_SKIP_PLUGIN.value, 'true')
})

test('Merges all environment variables', async (t) => {
  const {
    env: { TEST, LANG },
  } = await new Fixture('./fixtures/file_env')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_ENV, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.deepEqual(TEST.sources, ['configFile', 'ui'])
  t.is(TEST.value, 'testFile')
  t.deepEqual(LANG.sources, ['general'])
  t.true(isDefinedString(LANG.value))
})

test('Sets site environment variables', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_ENV, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.deepEqual(TEST.sources, ['ui'])
  t.is(TEST.value, 'test')
})

test('Does not set site environment variables on API error', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServer(SITE_INFO_RESPONSE_ERROR)
  t.true(isDefinedString(output))
})

test('Does not set site environment variables in the buildbot', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS_BUILDBOT)
    .runConfigServerAsObject([SITE_INFO_RESPONSE_ENV, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.is(TEST, undefined)
})

test('Does not set site environment variables if offline', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS_OFFLINE)
    .runConfigServerAsObject(SITE_INFO_RESPONSE_ENV)
  t.is(TEST, undefined)
})

test('Does not set site environment variables without a siteId', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS_NO_SITE_ID)
    .runConfigServerAsObject(SITE_INFO_RESPONSE_ENV)
  t.is(TEST, undefined)
})

test('Does not set site environment variables without a token', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS_NO_TOKEN)
    .runConfigServerAsObject(SITE_INFO_RESPONSE_ENV)
  t.is(TEST, undefined)
})

test('Sets accounts environment variables', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([...LIST_ACCOUNTS_RESPONSE_SUCCESS, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.deepEqual(TEST.sources, ['account'])
  t.is(TEST.value, 'test')
})

test('Does not set accounts environment variables if no matching account', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([LIST_ACCOUNTS_RESPONSE_MISMATCH, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables on API error', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServer(LIST_ACCOUNTS_RESPONSE_ERROR)
  t.true(isDefinedString(output))
})

test('Does not set accounts environment variables on API wrong response shape', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS)
    .runConfigServerAsObject([LIST_ACCOUNTS_RESPONSE_WRONG_SHAPE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables in the buildbot', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS_BUILDBOT)
    .runConfigServerAsObject([LIST_ACCOUNTS_RESPONSE_SUCCESS, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables if offline', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS_OFFLINE)
    .runConfigServerAsObject(LIST_ACCOUNTS_RESPONSE_SUCCESS)
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables without a siteId', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS_NO_SITE_ID)
    .runConfigServerAsObject(LIST_ACCOUNTS_RESPONSE_SUCCESS)
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables without a token', async (t) => {
  const {
    env: { TEST },
  } = await new Fixture('./fixtures/empty')
    .withFlags(AUTH_FLAGS_NO_TOKEN)
    .runConfigServerAsObject(LIST_ACCOUNTS_RESPONSE_SUCCESS)
  t.is(TEST, undefined)
})

test('Does not allow overridding readonly environment variables', async (t) => {
  const {
    env: { REVIEW_ID },
  } = await new Fixture('./fixtures/readonly').runWithConfigAsObject()
  t.is(REVIEW_ID, undefined)
})
