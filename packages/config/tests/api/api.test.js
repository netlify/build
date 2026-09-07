import { normalize } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

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

test('--token', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ token: 'test', testOpts: { env: true } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--token in CLI', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ token: 'test', testOpts: { env: true } })
    .runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('NETLIFY_AUTH_TOKEN environment variable', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ testOpts: { env: true } })
    .withEnv({ NETLIFY_AUTH_TOKEN: 'test' })
    .runWithConfig([FETCH_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--site-id', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ siteId: 'test' })
    .runWithConfig([FETCH_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--account-id in offline and buildbot mode', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ accountId: 'test-account', offline: true, mode: 'buildbot' })
    .runWithConfig([])
  const config = JSON.parse(output)

  expect(config.siteInfo.account_id).toBe('test-account')
})

test('NETLIFY_SITE_ID environment variable', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withEnv({ NETLIFY_SITE_ID: 'test' })
    .runWithConfig([FETCH_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Environment variable siteInfo success', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Environment variable siteInfo API error', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_ERROR, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Environment variable siteInfo no token', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ siteId: 'test' })
    .runConfigServer([SITE_INFO_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Environment variable siteInfo no siteId', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ token: 'test' })
    .runConfigServer([SITE_INFO_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Environment variable siteInfo offline', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ siteId: 'test', token: 'test', offline: true })
    .runConfigServer([SITE_INFO_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Environment variable siteInfo CI', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test', mode: 'buildbot' })
    .runConfigServer([SITE_INFO_DATA, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Build settings can be null', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS_NULL, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Use build settings if a siteId and token are provided', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Build settings have low merging priority', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/build_settings')
    .withFlags({ token: 'test', siteId: 'test', baseRelDir: true })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Build settings are not used without a token', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({ siteId: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Build settings are not used without a siteId', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({ token: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Build settings are not used in CI', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({ token: 'test', siteId: 'test', mode: 'buildbot' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])

  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Extensions are returned from getSiteInfo from v1 safe API when there is not accountID', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({
      token: 'test',
      siteId: 'test',
    })
    .runConfigServer([SITE_INFO_DATA, SITE_EXTENSIONS_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(1)
  expect(config.integrations[0].slug).toBe('test')
  expect(config.integrations[0].version).toBe('https://extension-test-1.netlify.app')
  expect(config.integrations[0].has_build).toBe(true)
})

test('In extension dev mode, extension specified in config is returned even if extension is not available in API', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/dev_extension')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
      accountId: 'account1',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(2)
  expect(config.integrations[0].slug).toBe('test')
  expect(config.integrations[1].slug).toBe('abc-extension')
  expect(config.integrations[1].has_build).toBe(false)
  expect(config.integrations[1].version).toBe('')
})

test('In extension dev mode, extension specified in config is returned even if extension is not enabled on site', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/dev_extension')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
      accountId: 'account1',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_EMPTY_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(1)
  expect(config.integrations[0].slug).toBe('abc-extension')
  expect(config.integrations[0].has_build).toBe(false)
  expect(config.integrations[0].version).toBe('')
})

test('In extension dev mode, extension specified in config is returned even if extension is not enabled on site and accountId not present', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/dev_extension')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
    })
    .runConfigServer([SITE_INFO_DATA, SITE_EXTENSIONS_EMPTY_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(1)
  expect(config.integrations[0].slug).toBe('abc-extension')
  expect(config.integrations[0].has_build).toBe(false)
  expect(config.integrations[0].version).toBe('')
})

test('In extension dev mode, extension specified in config is returned and build is forced by config', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/dev_extension_with_force_build')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
      accountId: 'account1',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_EMPTY_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(1)
  expect(config.integrations[0].slug).toBe('abc-extension')
  expect(config.integrations[0].has_build).toBe(true)
  expect(config.integrations[0].version).toBe('')
})

test('extensions are not returned if offline', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({
      offline: true,
      siteId: 'test',
      mode: 'buildbot',
      accountId: 'account1',
    })
    .runConfigServer([TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(0)
})

test('extensions and account id are returned if mode is buildbot', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'buildbot',
      accountId: 'account1',
      token: 'test',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(1)
  expect(config.integrations[0].slug).toBe('test')
  expect(config.integrations[0].version).toBe('https://extension-test-2.netlify.app')
  expect(config.integrations[0].has_build).toBe(true)

  // account id is also available
  expect(config.siteInfo).toBeTruthy()
  expect(config.siteInfo.account_id).toBe('account1')
})

test('extensions are returned if accountId is present and mode is dev', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'dev',
      token: 'test',
      accountId: 'account1',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(1)
  expect(config.integrations[0].slug).toBe('test')
  expect(config.integrations[0].version).toBe('https://extension-test-2.netlify.app')
  expect(config.integrations[0].has_build).toBe(true)
})

test('extensions are returned and called with a netlify-sdk-build-bot-token header', async () => {
  const { output, requests } = await new Fixture(import.meta.url, './fixtures/base')
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

  expect(installationsHeaders.includes('netlify-sdk-build-bot-token')).toBeTruthy()
  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(1)
  expect(config.integrations[0].slug).toBe('test')
  expect(config.integrations[0].version).toBe('https://extension-test-2.netlify.app')
  expect(config.integrations[0].has_build).toBe(true)
})

test('extensions are returned and called with a netlify-config-mode header', async () => {
  const { output, requests } = await new Fixture(import.meta.url, './fixtures/base')
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

  expect(installationsHeaders.includes('netlify-config-mode')).toBeTruthy()
  expect(config.integrations).toBeTruthy()
  expect(config.integrations.length).toBe(1)
  expect(config.integrations[0].slug).toBe('test')
  expect(config.integrations[0].version).toBe('https://extension-test-2.netlify.app')
  expect(config.integrations[0].has_build).toBe(true)
})

test('extensions are not returned if failed to fetch extensions', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/base')
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

  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('baseRelDir is true if build.base is overridden', async () => {
  const fixturesDir = normalize(`${fileURLToPath(import.meta.url)}/../fixtures`)

  const { output } = await new Fixture(import.meta.url, './fixtures/build_base_override')
    .withFlags({ cwd: `${fixturesDir}/build_base_override/subdir`, token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_BASE_REL_DIR, FETCH_EXTENSIONS_EMPTY_RESPONSE, SITE_EXTENSIONS_EMPTY_RESPONSE])
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('It does not fetch site info if cachedConfig is provided, use_cached_site_info is true and there is siteInfo, accounts, and extensions on cachedConfig', async () => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfigAsObject()
  const { requests } = await new Fixture(import.meta.url, './fixtures/cached_config')
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

  expect(requests.length).toBe(0)
})

test('It fetches site info if cachedConfig is provided, use_cached_site_info is true and there is no siteInfo, accounts, or extensions on cachedConfig', async () => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfigAsObject()
  const { requests } = await new Fixture(import.meta.url, './fixtures/cached_config')
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

  expect(requests.length).toBe(0)
})

test('It fetches site info if cachedConfig is provided, use_cached_site_info is false', async () => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfigAsObject()
  const { requests } = await new Fixture(import.meta.url, './fixtures/cached_config')
    .withFlags({
      cachedConfig,
    })
    .runConfigServer([SITE_INFO_DATA, SITE_EXTENSIONS_RESPONSE, TEAM_INSTALLATIONS_META_RESPONSE])

  expect(requests.length).toBe(0)
})

test('We call the staging extension API when the apiHost is not api.netlify.com', async () => {
  let baseUrl = ''
  const setBaseUrl = (url) => {
    baseUrl = url
  }

  await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'dev',
      token: 'test',
      accountId: 'account1',
      testOpts: { host: undefined, setBaseUrl },
      host: NETLIFY_API_STAGING_HOSTNAME,
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  expect(baseUrl).toBe(EXTENSION_API_STAGING_BASE_URL)
})

test('We call the production extension API when the apiHost is api.netlify.com', async () => {
  let baseUrl = ''
  const setBaseUrl = (url) => {
    baseUrl = url
  }

  await new Fixture(import.meta.url, './fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'dev',
      token: 'test',
      accountId: 'account1',
      testOpts: { host: undefined, setBaseUrl },
      host: 'api.netlify.com',
    })
    .runConfigServer([SITE_INFO_DATA, TEAM_INSTALLATIONS_META_RESPONSE, FETCH_EXTENSIONS_EMPTY_RESPONSE])

  expect(baseUrl).toBe(EXTENSION_API_BASE_URL)
})
