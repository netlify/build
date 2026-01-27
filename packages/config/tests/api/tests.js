import { normalize } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

import {
  EXTENSION_API_STAGING_BASE_URL,
  NETLIFY_API_STAGING_HOSTNAME,
  EXTENSION_API_BASE_URL,
} from '../../lib/extensions.js'

const SITE_INFO_PATH = '/api/v1/sites/test'
const SITE_INFO_DATA = {
  path: SITE_INFO_PATH,
  response: { ssl_url: 'test', name: 'test-name', build_settings: { repo_url: 'test' } },
}
const SITE_INFO_ERROR = {
  path: SITE_INFO_PATH,
  response: { error: 'invalid' },
  status: 400,
}

const SITE_EXTENSIONS_RESPONSE = {
  path: '/site/test/integrations/safe',
  response: [
    {
      author: '',
      extension_token: '',
      has_build: true,
      has_connector: false,
      name: '',
      slug: 'test',
      version: 'https://extension-test-1.netlify.app',
    },
  ],
}

const TEAM_INSTALLATIONS_META_RESPONSE = {
  path: '/team/account1/integrations/installations/meta/test',
  response: [
    {
      author: '',
      extension_token: '',
      has_build: true,
      has_connector: false,
      name: '',
      slug: 'test',
      version: 'https://extension-test-2.netlify.app',
    },
  ],
}

const TEAM_INSTALLATIONS_META_RESPONSE_INTERNAL_SERVER_ERROR = {
  path: '/team/account1/integrations/installations/meta/test',
  response: { error: 'Internal Server Error' },
  status: 500,
}

const SITE_EXTENSIONS_EMPTY_RESPONSE = {
  path: '/site/test/integrations/safe',
  response: [],
}

const TEAM_INSTALLATIONS_META_EMPTY_RESPONSE = {
  path: '/team/account1/integrations/installations/meta/test',
  response: [],
}

const SITE_INFO_BUILD_SETTINGS = {
  path: SITE_INFO_PATH,
  response: {
    ssl_url: 'test',
    name: 'test-name',
    build_settings: {
      cmd: 'testCommand',
      dir: 'testPublish',
      functions_dir: 'testFunctions',
      base: 'base',
      env: { TEST_ENV: 'test' },
      base_rel_dir: false,
    },
    plugins: [{ package: 'netlify-plugin-test', pinned_version: '1', inputs: { test: true } }],
  },
}
const SITE_INFO_BASE_REL_DIR = {
  path: SITE_INFO_PATH,
  response: {
    ssl_url: 'test',
    name: 'test-name',
    build_settings: { base_rel_dir: false },
  },
}
const SITE_INFO_BUILD_SETTINGS_NULL = {
  path: SITE_INFO_PATH,
  response: {
    ssl_url: 'test',
    name: 'test-name',
    build_settings: { cmd: null, dir: null, functions_dir: null, base: null, env: null, base_rel_dir: null },
  },
}

const FETCH_EXTENSIONS_EMPTY_RESPONSE = {
  path: '/integrations',
  response: [],
}

test('--token', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', testOpts: { env: true } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--token in CLI', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', testOpts: { env: true } })
    .runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('NETLIFY_AUTH_TOKEN environment variable', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ testOpts: { env: true } })
    .withEnv({ NETLIFY_AUTH_TOKEN: 'test' })
    .runWithConfig([FETCH_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('--site-id', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ siteId: 'test' })
    .runWithConfig([FETCH_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('--account-id in offline and buildbot mode', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ accountId: 'test-account', offline: true, mode: 'buildbot' })
    .runWithConfig([])
  const config = JSON.parse(output)

  t.is(config.siteInfo.account_id, 'test-account')
})

test('NETLIFY_SITE_ID environment variable', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withEnv({ NETLIFY_SITE_ID: 'test' })
    .runWithConfig([FETCH_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo success', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo API error', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_ERROR, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo no token', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ siteId: 'test' })
    .runConfigServer([SITE_INFO_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo no siteId', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test' })
    .runConfigServer([SITE_INFO_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo offline', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ siteId: 'test', token: 'test', offline: true })
    .runConfigServer([SITE_INFO_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo CI', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test', mode: 'buildbot' })
    .runConfigServer([SITE_INFO_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Build settings can be null', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS_NULL, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Use build settings if a siteId and token are provided', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Build settings have low merging priority', async (t) => {
  const { output } = await new Fixture('./fixtures/build_settings')
    .withFlags({ token: 'test', siteId: 'test', baseRelDir: true })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Build settings are not used without a token', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ siteId: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Build settings are not used without a siteId', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ token: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Build settings are not used in CI', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ token: 'test', siteId: 'test', mode: 'buildbot' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])

  t.snapshot(normalizeOutput(output))
})

test('Extensions are returned from getSiteInfo from v1 safe API when there is not accountID', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({
      token: 'test',
      siteId: 'test',
    })
    .runConfigServer([SITE_INFO_DATA, SITE_EXTENSIONS_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'test')
  t.assert(config.integrations[0].version === 'https://extension-test-1.netlify.app')
  t.assert(config.integrations[0].has_build === true)
})

test('In extension dev mode, extension specified in config is returned even if extension is not available in API', async (t) => {
  const { output } = await new Fixture('./fixtures/dev_extension')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
      accountId: 'account1',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 2)
  t.assert(config.integrations[0].slug === 'test')
  t.assert(config.integrations[1].slug === 'abc-extension')
  t.assert(config.integrations[1].has_build === false)
  t.assert(config.integrations[1].version === '')
})

test('In extension dev mode, extension specified in config is returned even if extension is not enabled on site', async (t) => {
  const { output } = await new Fixture('./fixtures/dev_extension')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
      accountId: 'account1',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_EMPTY_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'abc-extension')
  t.assert(config.integrations[0].has_build === false)
  t.assert(config.integrations[0].version === '')
})

test('In extension dev mode, extension specified in config is returned even if extension is not enabled on site and accountId not present', async (t) => {
  const { output } = await new Fixture('./fixtures/dev_extension')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
    })
    .runConfigServer([SITE_INFO_DATA, SITE_EXTENSIONS_EMPTY_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'abc-extension')
  t.assert(config.integrations[0].has_build === false)
  t.assert(config.integrations[0].version === '')
})

test('In extension dev mode, extension specified in config is returned and build is forced by config', async (t) => {
  const { output } = await new Fixture('./fixtures/dev_extension_with_force_build')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
      accountId: 'account1',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_EMPTY_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'abc-extension')
  t.assert(config.integrations[0].has_build === true)
  t.assert(config.integrations[0].version === '')
})

test('extensions are not returned if offline', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({
      offline: true,
      siteId: 'test',
      mode: 'buildbot',
      accountId: 'account1',
    })
    .runConfigServer([TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 0)
})

test('extensions and account id are returned if mode is buildbot', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'buildbot',
      accountId: 'account1',
      token: 'test',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.is(config.integrations.length, 1)
  t.is(config.integrations[0].slug, 'test')
  t.is(config.integrations[0].version, 'https://extension-test-2.netlify.app')
  t.is(config.integrations[0].has_build, true)

  // account id is also available
  t.assert(config.siteInfo)
  t.is(config.siteInfo.account_id, 'account1')
})

test('extensions are returned if accountId is present and mode is dev', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'dev',
      token: 'test',
      accountId: 'account1',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'test')
  t.assert(config.integrations[0].version === 'https://extension-test-2.netlify.app')
  t.assert(config.integrations[0].has_build === true)
})

test('extensions are returned and called with a netlify-sdk-build-bot-token header', async (t) => {
  const { output, requests } = await new Fixture('./fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'dev',
      token: 'test',
      accountId: 'account1',
      featureFlags: {
        send_build_bot_token_to_jigsaw: true,
      },
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)
  const installationsHeaders = requests.find(
    (request) => request.url === TEAM_INSTALLATIONS_META_RESPONSE.path,
  )?.headers

  t.assert(installationsHeaders.includes('netlify-sdk-build-bot-token'))
  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'test')
  t.assert(config.integrations[0].version === 'https://extension-test-2.netlify.app')
  t.assert(config.integrations[0].has_build === true)
})

test('extensions are returned and called with a netlify-config-mode header', async (t) => {
  const { output, requests } = await new Fixture('./fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'dev',
      token: 'test',
      accountId: 'account1',
      featureFlags: {
        send_build_bot_token_to_jigsaw: true,
      },
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)
  const installationsHeaders = requests.find(
    (request) => request.url === TEAM_INSTALLATIONS_META_RESPONSE.path,
  )?.headers

  t.assert(installationsHeaders.includes('netlify-config-mode'))
  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'test')
  t.assert(config.integrations[0].version === 'https://extension-test-2.netlify.app')
  t.assert(config.integrations[0].has_build === true)
})

test('extensions are not returned if failed to fetch extensions', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'buildbot',
      accountId: 'account1',
      token: 'test',
    })
    .runConfigServer([
      SITE_INFO_DATA,
      TEAM_INSTALLATIONS_META_RESPONSE_INTERNAL_SERVER_ERROR,
      FETCH_EXTENSIONS_EMPTY_RESPONSE,
    ])

  t.snapshot(normalizeOutput(output))
})

test('baseRelDir is true if build.base is overridden', async (t) => {
  const fixturesDir = normalize(`${fileURLToPath(test.meta.file)}/../fixtures`)

  const { output } = await new Fixture('./fixtures/build_base_override')
    .withFlags({ cwd: `${fixturesDir}/build_base_override/subdir`, token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_BASE_REL_DIR, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('It does not fetch site info if cachedConfig is provided, use_cached_site_info is true and there is siteInfo, accounts, and extensions on cachedConfig', async (t) => {
  const cachedConfig = await new Fixture('./fixtures/cached_config').runWithConfigAsObject()
  const { requests } = await new Fixture('./fixtures/cached_config')
    .withFlags({
      cachedConfig,
      siteId: 'test',
      mode: 'dev',
      token: 'test',
      accountId: 'account1',
      featureFlags: {
        use_cached_site_info: true,
      },
    })
    .runConfigServer([SITE_INFO_DATA, SITE_EXTENSIONS_RESPONSE, TEAM_INSTALLATIONS_META_RESPONSE])

  t.assert(requests.length === 0)
})

test('It fetches site info if cachedConfig is provided, use_cached_site_info is true and there is no siteInfo, accounts, or extensions on cachedConfig', async (t) => {
  const cachedConfig = await new Fixture('./fixtures/cached_config').runWithConfigAsObject()
  const { requests } = await new Fixture('./fixtures/cached_config')
    .withFlags({
      cachedConfig,
      siteId: 'test',
      mode: 'dev',
      token: 'test',
      accountId: 'account1',
      featureFlags: {
        use_cached_site_info: true,
      },
    })
    .runConfigServer([SITE_INFO_DATA, SITE_EXTENSIONS_RESPONSE, TEAM_INSTALLATIONS_META_RESPONSE])

  t.assert(requests.length === 0)
})

test('It fetches site info if cachedConfig is provided, use_cached_site_info is false', async (t) => {
  const cachedConfig = await new Fixture('./fixtures/cached_config').runWithConfigAsObject()
  const { requests } = await new Fixture('./fixtures/cached_config')
    .withFlags({
      cachedConfig,
    })
    .runConfigServer([SITE_INFO_DATA, SITE_EXTENSIONS_RESPONSE, TEAM_INSTALLATIONS_META_RESPONSE])

  t.assert(requests.length === 0)
})

test('We call the staging extension API when the apiHost is not api.netlify.com', async (t) => {
  let baseUrl = ''
  const setBaseUrl = (url) => {
    baseUrl = url
  }

  await new Fixture('./fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'dev',
      token: 'test',
      accountId: 'account1',
      testOpts: { host: undefined, setBaseUrl },
      host: NETLIFY_API_STAGING_HOSTNAME,
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  t.assert(baseUrl === EXTENSION_API_STAGING_BASE_URL)
})

test('We call the production extension API when the apiHost is api.netlify.com', async (t) => {
  let baseUrl = ''
  const setBaseUrl = (url) => {
    baseUrl = url
  }

  await new Fixture('./fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'dev',
      token: 'test',
      accountId: 'account1',
      testOpts: { host: undefined, setBaseUrl },
      host: 'api.netlify.com',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  t.assert(baseUrl === EXTENSION_API_BASE_URL)
})

const ACCOUNTS_DATA = {
  path: '/api/v1/accounts',
  response: [{ id: 'account1', slug: 'test-account', capabilities: { ai_gateway_disabled: { included: true } } }],
}

test('includeAccountCapabilities fetches full account data with capabilities', async (t) => {
  const { output, requests } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test', includeAccountCapabilities: true })
    .runConfigServer([SITE_INFO_DATA, ACCOUNTS_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])

  const accountsRequest = requests.find((req) => req.url === '/api/v1/accounts')
  t.truthy(accountsRequest, 'should make request to accounts endpoint')
  t.false(accountsRequest.url.includes('minimal'), 'should not include minimal parameter')

  const config = JSON.parse(output)
  t.truthy(config.accounts[0].capabilities, 'accounts should include capabilities')
})
