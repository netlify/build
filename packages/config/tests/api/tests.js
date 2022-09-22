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

test('--token', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', testOpts: { env: false } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--token in CLI', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', testOpts: { env: false } })
    .runBinary()
  t.snapshot(normalizeOutput(output))
})

test('NETLIFY_AUTH_TOKEN environment variable', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ testOpts: { env: false } })
    .withEnv({ NETLIFY_AUTH_TOKEN: 'test' })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--site-id', async (t) => {
  const output = await new Fixture('./fixtures/empty').withFlags({ siteId: 'test' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('NETLIFY_SITE_ID environment variable', async (t) => {
  const output = await new Fixture('./fixtures/empty').withEnv({ NETLIFY_SITE_ID: 'test' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo success', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runServer(SITE_INFO_DATA)
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo API error', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runServer(SITE_INFO_ERROR)
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo no token', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ siteId: 'test' }).runServer(SITE_INFO_DATA)
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo no siteId', async (t) => {
  const { output } = await new Fixture('./fixtures/empty').withFlags({ token: 'test' }).runServer(SITE_INFO_DATA)
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo offline', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ siteId: 'test', token: 'test', offline: true })
    .runServer(SITE_INFO_DATA)
  t.snapshot(normalizeOutput(output))
})

test('Environment variable siteInfo CI', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test', mode: 'buildbot' })
    .runServer(SITE_INFO_DATA)
  t.snapshot(normalizeOutput(output))
})

test('Build settings can be null', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ token: 'test', siteId: 'test' })
    .runServer(SITE_INFO_BUILD_SETTINGS_NULL)
  t.snapshot(normalizeOutput(output))
})

test('Use build settings if a siteId and token are provided', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ token: 'test', siteId: 'test' })
    .runServer(SITE_INFO_BUILD_SETTINGS)
  t.snapshot(normalizeOutput(output))
})

test('Build settings have low merging priority', async (t) => {
  const { output } = await new Fixture('./fixtures/build_settings')
    .withFlags({ token: 'test', siteId: 'test', baseRelDir: true })
    .runServer(SITE_INFO_BUILD_SETTINGS)
  t.snapshot(normalizeOutput(output))
})

test('Build settings are not used without a token', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ siteId: 'test' })
    .runServer(SITE_INFO_BUILD_SETTINGS)
  t.snapshot(normalizeOutput(output))
})

test('Build settings are not used without a siteId', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ token: 'test' })
    .runServer(SITE_INFO_BUILD_SETTINGS)
  t.snapshot(normalizeOutput(output))
})

test('Build settings are not used in CI', async (t) => {
  const { output } = await new Fixture('./fixtures/base')
    .withFlags({ token: 'test', siteId: 'test', mode: 'buildbot' })
    .runServer(SITE_INFO_BUILD_SETTINGS)
  t.snapshot(normalizeOutput(output))
})

test('baseRelDir is true if build.base is overridden', async (t) => {
  const fixturesDir = normalize(`${fileURLToPath(test.meta.file)}/../fixtures`)

  const { output } = await new Fixture('./fixtures/build_base_override')
    .withFlags({ cwd: `${fixturesDir}/build_base_override/subdir`, token: 'test', siteId: 'test' })
    .runServer(SITE_INFO_BASE_REL_DIR)
  t.snapshot(normalizeOutput(output))
})
