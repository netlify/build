'use strict'

const { relative } = require('path')
const { cwd } = require('process')

const test = require('ava')

const resolveConfig = require('../..')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')

test('Empty configuration', async (t) => {
  await runFixture(t, 'empty')
})

test('No --config but none found', async (t) => {
  await runFixture(t, 'none', { copyRoot: {} })
})

test('--config with an absolute path', async (t) => {
  await runFixture(t, '', { flags: { config: `${FIXTURES_DIR}/empty/netlify.toml` } })
})

test('--config with a relative path', async (t) => {
  await runFixture(t, '', { flags: { config: `${relative(cwd(), FIXTURES_DIR)}/empty/netlify.toml` } })
})

test('--config with an invalid relative path', async (t) => {
  await runFixture(t, '', { flags: { config: '/invalid' } })
})

test('--defaultConfig CLI flag', async (t) => {
  const defaultConfig = JSON.stringify({ build: { publish: 'publish' } })
  await runFixture(t, 'default_merge', { flags: { defaultConfig }, useBinary: true })
})

test('--defaultConfig merge', async (t) => {
  const defaultConfig = { build: { publish: 'publish' } }
  await runFixture(t, 'default_merge', { flags: { defaultConfig } })
})

test('--defaultConfig priority', async (t) => {
  const defaultConfig = { build: { command: 'echo commandDefault' } }
  await runFixture(t, 'default_priority', { flags: { defaultConfig } })
})

test('--defaultConfig merges UI plugins with config plugins', async (t) => {
  const defaultConfig = { plugins: [{ package: 'one', inputs: { test: false, testThree: true } }] }
  await runFixture(t, 'plugins_merge', { flags: { defaultConfig } })
})

test('--defaultConfig can specify pinned versions', async (t) => {
  await runFixture(t, 'empty', { flags: { defaultConfig: { plugins: [{ package: 'one', pinned_version: '1' }] } } })
})

test('--inlineConfig CLI flag', async (t) => {
  const inlineConfig = JSON.stringify({ build: { publish: 'publish' } })
  await runFixture(t, 'default_merge', { flags: { inlineConfig }, useBinary: true })
})

test('--inlineConfig is merged', async (t) => {
  const inlineConfig = { build: { publish: 'publish' } }
  await runFixture(t, 'default_merge', { flags: { inlineConfig } })
})

test('--inlineConfig is merged with priority', async (t) => {
  const inlineConfig = { build: { command: 'echo commandInline' } }
  await runFixture(t, 'default_priority', { flags: { inlineConfig } })
})

test('--inlineConfig falsy values are ignored', async (t) => {
  const inlineConfig = { build: { command: '', publish: undefined } }
  await runFixture(t, 'default_priority', { flags: { inlineConfig } })
})

test('--inlineConfig can override the "base"', async (t) => {
  const defaultConfig = { build: { base: 'defaultBase' } }
  const inlineConfig = { build: { base: 'base' } }
  await runFixture(t, 'merge_base', { flags: { defaultConfig, inlineConfig } })
})

test('--cachedConfig CLI flags', async (t) => {
  const { returnValue } = await runFixture(t, 'cached_config', { snapshot: false })
  await runFixture(t, 'cached_config', { flags: { cachedConfig: returnValue }, useBinary: true })
})

test('--cachedConfig', async (t) => {
  const { returnValue } = await runFixture(t, 'cached_config', { snapshot: false })
  const cachedConfig = JSON.parse(returnValue)
  await runFixture(t, 'cached_config', { flags: { cachedConfig } })
})

test('--cachedConfig with a token', async (t) => {
  const { returnValue } = await runFixture(t, 'cached_config', { snapshot: false })
  const cachedConfig = JSON.parse(returnValue)
  await runFixture(t, 'cached_config', { flags: { cachedConfig, token: 'test' } })
})

test('--cachedConfig with a siteId', async (t) => {
  const { returnValue } = await runFixture(t, 'cached_config', { snapshot: false, flags: { siteId: 'test' } })
  const cachedConfig = JSON.parse(returnValue)
  await runFixture(t, 'cached_config', { flags: { cachedConfig, siteId: 'test' } })
})

test('Programmatic', async (t) => {
  const { config } = await resolveConfig({ repositoryRoot: `${FIXTURES_DIR}/empty` })
  t.not(config.build.environment, undefined)
})

test('Programmatic no options', async (t) => {
  const { config } = await resolveConfig()
  t.not(config.build.environment, undefined)
})

test('featureFlags can be used programmatically', async (t) => {
  await runFixture(t, 'empty', { flags: { featureFlags: { test: true, testTwo: false } } })
})

test('featureFlags can be used in the CLI', async (t) => {
  await runFixture(t, 'empty', { flags: { featureFlags: { test: true, testTwo: false } }, useBinary: true })
})
