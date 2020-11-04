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
  const {
    env: { all },
  } = await getFixtureConfig(t, 'empty', { flags: { mode: 'buildbot' } })
  t.is(Object.keys(all).length, 0)
})

test('Sets LANG environment variable', async (t) => {
  const {
    env: {
      general: { LANG },
    },
  } = await getFixtureConfig(t, 'empty')
  t.true(isDefinedString(LANG))
})

test('Sets LANGUAGE environment variable', async (t) => {
  const {
    env: {
      general: { LANGUAGE },
    },
  } = await getFixtureConfig(t, 'empty')
  t.true(isDefinedString(LANGUAGE))
})

test('Sets LC_ALL environment variable', async (t) => {
  const {
    env: {
      general: { LC_ALL },
    },
  } = await getFixtureConfig(t, 'empty')
  t.true(isDefinedString(LC_ALL))
})

test('Sets GATSBY_TELEMETRY_DISABLED environment variable', async (t) => {
  const {
    env: {
      general: { GATSBY_TELEMETRY_DISABLED },
    },
  } = await getFixtureConfig(t, 'empty')
  t.true(isDefinedString(GATSBY_TELEMETRY_DISABLED))
})

test('Sets NEXT_TELEMETRY_DISABLED environment variable', async (t) => {
  const {
    env: {
      general: { NEXT_TELEMETRY_DISABLED },
    },
  } = await getFixtureConfig(t, 'empty')
  t.true(isDefinedString(NEXT_TELEMETRY_DISABLED))
})

test('Sets PULL_REQUEST environment variable', async (t) => {
  const {
    env: {
      general: { PULL_REQUEST },
    },
  } = await getFixtureConfig(t, 'empty')
  t.true(isDefinedString(PULL_REQUEST))
})

test('Sets COMMIT_REF environment variable', async (t) => {
  const {
    env: {
      general: { COMMIT_REF },
    },
  } = await getFixtureConfig(t, 'empty')
  t.true(isDefinedString(COMMIT_REF))
})

test('Sets CACHED_COMMIT_REF environment variable', async (t) => {
  const {
    env: {
      general: { CACHED_COMMIT_REF },
    },
  } = await getFixtureConfig(t, 'empty')
  t.true(isDefinedString(CACHED_COMMIT_REF))
})

test('Sets HEAD environment variable', async (t) => {
  const {
    env: {
      general: { HEAD },
    },
  } = await getFixtureConfig(t, 'empty')
  t.true(isDefinedString(HEAD))
})

test('Sets BRANCH environment variable', async (t) => {
  const {
    env: {
      general: { BRANCH },
    },
  } = await getFixtureConfig(t, 'empty', { flags: { branch: 'test' } })
  t.is(BRANCH, 'test')
})

test('Does not set some git-related environment variables if no repository', async (t) => {
  const {
    env: {
      general: { COMMIT_REF },
    },
  } = await getFixtureConfig(t, 'empty', { copyRoot: { git: false } })
  t.is(COMMIT_REF, undefined)
})

test('Sets CONTEXT environment variable', async (t) => {
  const {
    env: {
      general: { CONTEXT },
    },
  } = await getFixtureConfig(t, 'empty', { flags: { context: 'test' } })
  t.is(CONTEXT, 'test')
})

test('Sets DEPLOY_ID environment variable', async (t) => {
  const {
    env: {
      general: { DEPLOY_ID },
    },
  } = await getFixtureConfig(t, 'empty', { flags: { deployId: 'test' } })
  t.is(DEPLOY_ID, 'test')
})

test('Sets URL environment variable', async (t) => {
  const {
    env: {
      general: { URL },
    },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_URL, { flags: AUTH_FLAGS })
  t.is(URL, 'test')
})

test('Sets REPOSITORY_URL environment variable', async (t) => {
  const {
    env: {
      general: { REPOSITORY_URL },
    },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_REPO_URL, { flags: AUTH_FLAGS })
  t.is(REPOSITORY_URL, 'test')
})

test('Sets config file environment variables', async (t) => {
  const {
    env: {
      configFile: { TEST },
    },
  } = await getFixtureConfig(t, 'file_env')
  t.is(TEST, 'testFile')
})

test('Sets config file empty environment variables', async (t) => {
  const {
    env: {
      configFile: { TEST },
    },
  } = await getFixtureConfig(t, 'file_env_empty')
  t.is(TEST, '')
})

test('Merges all environment variables', async (t) => {
  const {
    env: {
      all: { TEST, LANG },
    },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS, fixtureName: 'file_env' })
  t.is(TEST, 'testFile')
  t.true(isDefinedString(LANG))
})

test('Sets site environment variables', async (t) => {
  const {
    env: {
      ui: { TEST },
    },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS })
  t.is(TEST, 'test')
})

test('Does not set site environment variables on API error', async (t) => {
  const error = await runWithMockServer(t, SITE_INFO_RESPONSE_ERROR, { flags: AUTH_FLAGS })
  t.true(isDefinedString(error))
})

test('Does not set site environment variables in the buildbot', async (t) => {
  const {
    env: {
      ui: { TEST },
    },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS_BUILDBOT })
  t.is(TEST, undefined)
})

test('Does not set site environment variables if offline', async (t) => {
  const {
    env: {
      ui: { TEST },
    },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS_OFFLINE })
  t.is(TEST, undefined)
})

test('Does not set site environment variables without a siteId', async (t) => {
  const {
    env: {
      ui: { TEST },
    },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS_NO_SITE_ID })
  t.is(TEST, undefined)
})

test('Does not set site environment variables without a token', async (t) => {
  const {
    env: {
      ui: { TEST },
    },
  } = await runWithMockServer(t, SITE_INFO_RESPONSE_ENV, { flags: AUTH_FLAGS_NO_TOKEN })
  t.is(TEST, undefined)
})

test('Sets accounts environment variables', async (t) => {
  const {
    env: {
      account: { TEST },
    },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS })
  t.is(TEST, 'test')
})

test('Does not set accounts environment variables if no matching account', async (t) => {
  const {
    env: {
      account: { TEST },
    },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_MISMATCH, { flags: AUTH_FLAGS })
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables on API error', async (t) => {
  const error = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_ERROR, { flags: AUTH_FLAGS })
  t.true(isDefinedString(error))
})

test('Does not set accounts environment variables on API wrong response shape', async (t) => {
  const {
    env: {
      account: { TEST },
    },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_WRONG_SHAPE, { flags: AUTH_FLAGS })
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables in the buildbot', async (t) => {
  const {
    env: {
      account: { TEST },
    },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_BUILDBOT })
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables if offline', async (t) => {
  const {
    env: {
      account: { TEST },
    },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_OFFLINE })
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables without a siteId', async (t) => {
  const {
    env: {
      account: { TEST },
    },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_NO_SITE_ID })
  t.is(TEST, undefined)
})

test('Does not set accounts environment variables without a token', async (t) => {
  const {
    env: {
      account: { TEST },
    },
  } = await runWithMockServer(t, LIST_ACCOUNTS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_NO_TOKEN })
  t.is(TEST, undefined)
})

test('Sets addons environment variables', async (t) => {
  const {
    env: {
      addons: { TEST },
    },
  } = await runWithMockServer(t, LIST_ADDONS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS })
  t.is(TEST, 'test')
})

test('Does not set addons environment variables on API error', async (t) => {
  const error = await runWithMockServer(t, LIST_ADDONS_RESPONSE_ERROR, { flags: AUTH_FLAGS })
  t.true(isDefinedString(error))
})

test('Does not set addons environment variables on API wrong response shape', async (t) => {
  const {
    env: {
      addons: { TEST },
    },
  } = await runWithMockServer(t, LIST_ADDONS_RESPONSE_WRONG_SHAPE, { flags: AUTH_FLAGS })
  t.is(TEST, undefined)
})

test('Does not set addons environment variables if offline', async (t) => {
  const {
    env: {
      addons: { TEST },
    },
  } = await runWithMockServer(t, LIST_ADDONS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_OFFLINE })
  t.is(TEST, undefined)
})

test('Does not set addons environment variables without a siteId', async (t) => {
  const {
    env: {
      addons: { TEST },
    },
  } = await runWithMockServer(t, LIST_ADDONS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_NO_SITE_ID })
  t.is(TEST, undefined)
})

test('Does not set addons environment variables without a token', async (t) => {
  const {
    env: {
      addons: { TEST },
    },
  } = await runWithMockServer(t, LIST_ADDONS_RESPONSE_SUCCESS, { flags: AUTH_FLAGS_NO_TOKEN })
  t.is(TEST, undefined)
})

test('Does not allow overridding readonly environment variables', async (t) => {
  const {
    env: {
      addons: { REVIEW_ID },
    },
  } = await getFixtureConfig(t, 'readonly')
  t.is(REVIEW_ID, undefined)
})
