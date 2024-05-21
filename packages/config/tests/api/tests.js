import { normalize } from 'path'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

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

const SITE_INTEGRATIONS_RESPONSE = {
  path: '/site/test/integrations/safe',
  response: [
    {
      slug: 'test',
      version: 'so-cool',
      has_build: true,
    },
  ],
}

const TEAM_INSTALLATIONS_META_RESPONSE = {
  path: '/team/team1/integrations/installations/meta',
  response: [
    {
      slug: 'test',
      version: 'so-cool',
      has_build: true,
    },
  ],
}

const SITE_INTEGRATIONS_EMPTY_RESPONSE = {
  path: '/site/test/integrations/safe',
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
const FETCH_INTEGRATIONS_RESPONSE = {
  path: '/integrations',
  response: [
    {
      slug: 'test',
      hostSiteUrl: 'https://some-site.netlify.app',
    },
    {
      slug: 'abc-integration',
      hostSiteUrl: 'https://some-site-2.netlify.app',
    },
  ],
}
const FETCH_INTEGRATIONS_EMPTY_RESPONSE = {
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
    .runWithConfig([FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('--site-id', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ siteId: 'test' })
    .runWithConfig([FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('NETLIFY_SITE_ID environment variable', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withEnv({ NETLIFY_SITE_ID: 'test' })
    .runWithConfig([FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo success', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_DATA, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo API error', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_ERROR, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo no token', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ siteId: 'test' })
    .runConfigServer([SITE_INFO_DATA, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo no siteId', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test' })
    .runConfigServer([SITE_INFO_DATA, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo offline', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ siteId: 'test', token: 'test', offline: true })
    .runConfigServer([SITE_INFO_DATA, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo CI', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test', mode: 'buildbot' })
    .runConfigServer([SITE_INFO_DATA, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Build settings can be null', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS_NULL, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Use build settings if a siteId and token are provided', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Build settings have low merging priority', async (t) => {
  const { output } = await new Fixture('./fixtures/build_settings')
    .withFlags({ token: 'test', siteId: 'test', baseRelDir: true })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Build settings are not used without a token', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ siteId: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Build settings are not used without a siteId', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ token: 'test' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})

test('Build settings are not used in CI', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ token: 'test', siteId: 'test', mode: 'buildbot' })
    .runConfigServer([SITE_INFO_BUILD_SETTINGS, FETCH_INTEGRATIONS_EMPTY_RESPONSE])

  t.snapshot(normalizeOutput(output))
})

test('Integrations are returned if feature flag is true', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({
      token: 'test',
      siteId: 'test',
    })
    .runConfigServer([SITE_INFO_DATA, SITE_INTEGRATIONS_RESPONSE, FETCH_INTEGRATIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'test')
  t.assert(config.integrations[0].version === 'so-cool')
  t.assert(config.integrations[0].has_build === true)
})

test('Integration specified in config is also returned if integration is available in API', async (t) => {
  const { output } = await new Fixture('./fixtures/integration')
    .withFlags({
      token: 'test',
      siteId: 'test',
    })
    .runConfigServer([SITE_INFO_DATA, SITE_INTEGRATIONS_RESPONSE, FETCH_INTEGRATIONS_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 2)
  t.assert(config.integrations[0].slug === 'test')
  t.assert(config.integrations[1].slug === 'abc-integration')
  t.assert(config.integrations[1].has_build === false)
  t.assert(config.integrations[1].version === 'https://some-site-2.netlify.app')
})

test('Integration specified in config is not returned if integration is not available in API', async (t) => {
  const { output } = await new Fixture('./fixtures/integration')
    .withFlags({
      token: 'test',
      siteId: 'test',
    })
    .runConfigServer([SITE_INFO_DATA, SITE_INTEGRATIONS_RESPONSE, FETCH_INTEGRATIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'test')
})

test('In integration dev mode, integration specified in config is returned even if integration is not available in API', async (t) => {
  const { output } = await new Fixture('./fixtures/dev_integration')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
    })
    .runConfigServer([SITE_INFO_DATA, SITE_INTEGRATIONS_RESPONSE, FETCH_INTEGRATIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 2)
  t.assert(config.integrations[0].slug === 'test')
  t.assert(config.integrations[1].slug === 'abc-integration')
  t.assert(config.integrations[1].has_build === false)
  t.assert(config.integrations[1].version === undefined)
})

test('In integration dev mode, integration specified in config is returned even if integration is not enabled on site', async (t) => {
  const { output } = await new Fixture('./fixtures/dev_integration')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
    })
    .runConfigServer([SITE_INFO_DATA, SITE_INTEGRATIONS_EMPTY_RESPONSE, FETCH_INTEGRATIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'abc-integration')
  t.assert(config.integrations[0].has_build === false)
  t.assert(config.integrations[0].version === undefined)
})

test('In integration dev mode, integration specified in config is returned and build is forced by config', async (t) => {
  const { output } = await new Fixture('./fixtures/dev_integration_with_force_build')
    .withFlags({
      token: 'test',
      siteId: 'test',
      context: 'dev',
    })
    .runConfigServer([SITE_INFO_DATA, SITE_INTEGRATIONS_EMPTY_RESPONSE, FETCH_INTEGRATIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'abc-integration')
  t.assert(config.integrations[0].has_build === true)
  t.assert(config.integrations[0].version === undefined)
})

// old tests
test.skip('Integrations are returned if feature flag is true, mode buildbot', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'buildbot',
    })
    .runConfigServer([SITE_INTEGRATIONS_RESPONSE, FETCH_INTEGRATIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'test')
  t.assert(config.integrations[0].version === 'so-cool')
  t.assert(config.integrations[0].has_build === true)
})

test.skip('Integrations are not returned if offline', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({
      offline: true,
      siteId: 'test',
      mode: 'buildbot',
    })
    .runConfigServer([SITE_INTEGRATIONS_RESPONSE, FETCH_INTEGRATIONS_EMPTY_RESPONSE])

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 0)
})

// new tests
test.only('Integrations are returned if flag is true for site and mode is buildbot', async (t) => {
  console.log('logs work')
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({
      siteId: 'test',
      mode: 'buildbot',
    })
    .runConfigServer([TEAM_INSTALLATIONS_META_RESPONSE, FETCH_INTEGRATIONS_EMPTY_RESPONSE])

  console.log(output)

  const config = JSON.parse(output)

  t.assert(config.integrations)
  t.assert(config.integrations.length === 1)
  t.assert(config.integrations[0].slug === 'test')
  t.assert(config.integrations[0].version === 'so-cool')
  t.assert(config.integrations[0].has_build === true)
})
test('Integrations are returned if flag is true for site and mode is dev', () => {})
test('2Integrations are not returned if offline', () => {})

test('baseRelDir is true if build.base is overridden', async (t) => {
  const fixturesDir = normalize(`${fileURLToPath(test.meta.file)}/../fixtures`)

  const { output } = await new Fixture('./fixtures/build_base_override')
    .withFlags({ cwd: `${fixturesDir}/build_base_override/subdir`, token: 'test', siteId: 'test' })
    .runConfigServer([SITE_INFO_BASE_REL_DIR, FETCH_INTEGRATIONS_EMPTY_RESPONSE])
  t.snapshot(normalizeOutput(output))
})
