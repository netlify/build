'use strict'

const test = require('ava')

const { getFixtureConfig, startServer } = require('../helpers/main')

// List of API endpoints to mock
const SITE_INFO_PATH = '/api/v1/sites/test'
const LIST_ACCOUNTS_PATH = '/api/v1/accounts'
const LIST_ADDONS_PATH = '/api/v1/sites/test/service-instances'

// List of API mock URLs, responses and status codes
const SITE_INFO_RESPONSE_URL = {
  path: SITE_INFO_PATH,
  response: { url: 'test' },
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
const LIST_ADDONS_RESPONSE_SUCCESS = {
  path: LIST_ADDONS_PATH,
  response: [{ env: { TEST: 'test' } }],
}
const LIST_ADDONS_RESPONSE_ERROR = {
  path: LIST_ADDONS_PATH,
  status: 500,
}
const LIST_ADDONS_RESPONSE_WRONG_SHAPE = {
  path: LIST_ADDONS_PATH,
  response: {},
}

// List of authenticating-related CLI flags
const AUTH_FLAGS = { token: 'test', siteId: 'test' }
const AUTH_FLAGS_NO_SITE_ID = { token: 'test' }
const AUTH_FLAGS_NO_TOKEN = { siteId: 'test' }
const AUTH_FLAGS_BUILDBOT = { token: 'test', siteId: 'test', mode: 'buildbot' }
const AUTH_FLAGS_OFFLINE = { token: 'test', siteId: 'test', offline: true }

// Runs a fixture using a mock API server
const runWithMockServer = async function (t, handlers, { flags, fixtureName = 'empty' }) {
  const { scheme, host, stopServer } = await startServer(handlers)
  try {
    return await getFixtureConfig(t, fixtureName, { flags: { testOpts: { scheme, host }, ...flags } })
  } finally {
    await stopServer()
  }
}

const isDefinedString = function (string) {
  return typeof string === 'string' && string.trim().length !== 0
}

test('Does not set environment variable in the buildbot', async (t) => {
  const { env } = await getFixtureConfig(t, 'empty', { flags: { mode: 'buildbot' } })
  t.is(Object.keys(env).length, 0)
})

test('Sets LANG environment variable', async (t) => {
  const {
    env: { LANG },
  } = await getFixtureConfig(t, 'empty')
  t.deepEqual(LANG.sources, ['general'])
  t.true(isDefinedString(LANG.value))
})

test('Sets LANGUAGE environment variable', async (t) => {
  const {
    env: { LANGUAGE },
  } = await getFixtureConfig(t, 'empty')
  t.deepEqual(LANGUAGE.sources, ['general'])
  t.true(isDefinedString(LANGUAGE.value))
})

test('Sets LC_ALL environment variable', async (t) => {
  const {
    env: { LC_ALL },
  } = await getFixtureConfig(t, 'empty')
  t.deepEqual(LC_ALL.sources, ['general'])
  t.true(isDefinedString(LC_ALL.value))
})

test('Sets GATSBY_TELEMETRY_DISABLED environment variable', async (t) => {
  const {
    env: { GATSBY_TELEMETRY_DISABLED },
  } = await getFixtureConfig(t, 'empty')
  t.deepEqual(GATSBY_TELEMETRY_DISABLED.sources, ['general'])
  t.true(isDefinedString(GATSBY_TELEMETRY_DISABLED.value))
})

test('Sets NEXT_TELEMETRY_DISABLED environment variable', async (t) => {
  const {
    env: { NEXT_TELEMETRY_DISABLED },
  } = await getFixtureConfig(t, 'empty')
  t.deepEqual(NEXT_TELEMETRY_DISABLED.sources, ['general'])
  t.true(isDefinedString(NEXT_TELEMETRY_DISABLED.value))
})

test('Sets PULL_REQUEST environment variable', async (t) => {
  const {
    env: { PULL_REQUEST },
  } = await getFixtureConfig(t, 'empty')
  t.deepEqual(PULL_REQUEST.sources, ['general'])
  t.true(isDefinedString(PULL_REQUEST.value))
})

test('Sets COMMIT_REF environment variable', async (t) => {
  const {
    env: { COMMIT_REF },
  } = await getFixtureConfig(t, 'empty')
  t.deepEqual(COMMIT_REF.sources, ['general'])
  t.true(isDefinedString(COMMIT_REF.value))
})

test('Sets CACHED_COMMIT_REF environment variable', async (t) => {
  const {
    env: { CACHED_COMMIT_REF },
  } = await getFixtureConfig(t, 'empty')
  t.deepEqual(CACHED_COMMIT_REF.sources, ['general'])
  t.true(isDefinedString(CACHED_COMMIT_REF.value))
})

test('Sets HEAD environment variable', async (t) => {
  const {
    env: { HEAD },
  } = await getFixtureConfig(t, 'empty')
  t.deepEqual(HEAD.sources, ['general'])
  t.true(isDefinedString(HEAD.value))
})

test('Sets BRANCH environment variable', async (t) => {
  const {
    env: { BRANCH },
  } = await getFixtureConfig(t, 'empty', { flags: { branch: 'test' } })
  t.deepEqual(BRANCH.sources, ['general'])
  t.is(BRANCH.value, 'test')
})

test('Do not recompute branch when using previousResult', async (t) => {
  const previousResult = await getFixtureConfig(t, 'empty', { flags: { branch: 'test' } })
  const {
    env: { BRANCH },
  } = await getFixtureConfig(t, 'empty', { flags: { branch: undefined, previousResult } })
  t.is(BRANCH.value, 'test')
})

test('Does not set some git-related environment variables if no repository', async (t) => {
  const {
    env: { COMMIT_REF },
  } = await getFixtureConfig(t, 'empty', { copyRoot: { git: false } })
  t.is(COMMIT_REF, undefined)
})

test('Sets CONTEXT environment variable', async (t) => {
  const {
    env: { CONTEXT },
  } = await getFixtureConfig(t, 'empty', { flags: { context: 'test' } })
  t.deepEqual(CONTEXT.sources, ['general'])
  t.is(CONTEXT.value, 'test')
})

test('Sets DEPLOY_ID environment variable', async (t) => {
  const {
    env: { DEPLOY_ID },
  } = await getFixtureConfig(t, 'empty', { flags: { deployId: 'test' } })
  t.deepEqual(DEPLOY_ID.sources, ['general'])
  t.is(DEPLOY_ID.value, 'test')
})

test('Sets SITE_ID environment variable', async (t) => {
  const {
    env: { SITE_ID },
  } = await getFixtureConfig(t, 'empty', { flags: { siteId: 'test' } })
  t.deepEqual(SITE_ID.sources, ['general'])
  t.is(SITE_ID.value, 'test')
})

test('Does not set SITE_ID environment variable if no flag is provided', async (t) => {
  const {
    env: { SITE_ID },
  } = await getFixtureConfig(t, 'empty')
  t.is(SITE_ID, undefined)
})

test('Sets SITE_NAME environment variable', async (t) => {
  const {
    env: { SITE_NAME },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_NAME, { flags: AUTH_FLAGS })
  t.deepEqual(SITE_NAME.sources, ['general'])
  t.is(SITE_NAME.value, 'test-name')
})

test('Does not set SITE_NAME environment variable if offline', async (t) => {
  const {
    env: { SITE_NAME },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS_OFFLINE })
  t.is(SITE_NAME, undefined)
})

test('Sets URL environment variable', async (t) => {
  const {
    env: { URL },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_URL, { flags: AUTH_FLAGS })
  t.deepEqual(URL.sources, ['general'])
  t.is(URL.value, 'test')
})

test('Sets REPOSITORY_URL environment variable', async (t) => {
  const {
    env: { REPOSITORY_URL },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_REPO_URL, { flags: AUTH_FLAGS })
  t.deepEqual(REPOSITORY_URL.sources, ['general'])
  t.is(REPOSITORY_URL.value, 'test')
})

test('Sets config file environment variables', async (t) => {
  const {
    env: { TEST },
  } = await getFixtureConfig(t, 'file_env')
  t.deepEqual(TEST.sources, ['configFile'])
  t.is(TEST.value, 'testFile')
})

test('Sets config file empty environment variables', async (t) => {
  const {
    env: { TEST },
  } = await getFixtureConfig(t, 'file_env_empty')
  t.deepEqual(TEST.sources, ['configFile'])
  t.is(TEST.value, '')
})

test('Merges all environment variables', async (t) => {
  const {
    env: { TEST, LANG },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS, fixtureName: 'file_env' })
  t.deepEqual(TEST.sources, ['configFile', 'ui'])
  t.is(TEST.value, 'testFile')
  t.deepEqual(LANG.sources, ['general'])
  t.true(isDefinedString(LANG.value))
})

test('Sets site environment variables', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS })
  t.deepEqual(TEST.sources, ['ui'])
  t.is(TEST.value, 'test')
})

test('Does not set site environment variables on API error', async (t) => {
  const error = await runWithMockServer(t, SITE_INFO_RESPONSE_ERROR, { flags: AUTH_FLAGS })
  t.true(isDefinedString(error))
})

test('Does not set site environment variables in the buildbot', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS_BUILDBOT })
  t.is(TEST, undefined)
})

test('Does not set site environment variables if offline', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS_OFFLINE })
  t.is(TEST, undefined)
})

test('Does not set site environment variables without a siteId', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS_NO_SITE_ID })
  t.is(TEST, undefined)
})

test('Does not set site environment variables without a token', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS_NO_TOKEN })
  t.is(TEST, undefined)
})

test('Sets accounts environment variables', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS })
  t.deepEqual(TEST.sources, ['account'])
  t.is(TEST.value, 'test')
})

test('Does not set accounts environment variables if no matching account', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_MISMATCH, { flags: AUTH_FLAGS })
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables on API error', async (t) => {
  const error = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_ERROR, { flags: AUTH_FLAGS })
  t.true(isDefinedString(error))
})

test('Does not set accounts environment variables on API wrong response shape', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_WRONG_SHAPE, { flags: AUTH_FLAGS })
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables in the buildbot', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_BUILDBOT })
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables if offline', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_OFFLINE })
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables without a siteId', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_NO_SITE_ID })
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables without a token', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_NO_TOKEN })
  t.is(TEST, undefined)
})

test('Sets addons environment variables', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ADDONS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS })
  t.deepEqual(TEST.sources, ['addons'])
  t.is(TEST.value, 'test')
})

test('Does not set addons environment variables on API error', async (t) => {
  const error = await runWithMockServer(t, LIST_ADDONS_RESPONSE_ERROR, { flags: AUTH_FLAGS })
  t.true(isDefinedString(error))
})

test('Does not set addons environment variables on API wrong response shape', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ADDONS_RESPONSE_WRONG_SHAPE, { flags: AUTH_FLAGS })
  t.is(TEST, undefined)
})

test('Does not set addons environment variables if offline', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ADDONS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_OFFLINE })
  t.is(TEST, undefined)
})

test('Does not set addons environment variables without a siteId', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ADDONS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_NO_SITE_ID })
  t.is(TEST, undefined)
})

test('Does not set addons environment variables without a token', async (t) => {
  const {
    env: { TEST },
  } = await runWithMockServer(t, LIST_ADDONS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_NO_TOKEN })
  t.is(TEST, undefined)
})

test('Does not allow overridding readonly environment variables', async (t) => {
  const {
    env: { REVIEW_ID },
  } = await getFixtureConfig(t, 'readonly')
  t.is(REVIEW_ID, undefined)
})
