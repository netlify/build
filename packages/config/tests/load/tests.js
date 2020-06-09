const { relative } = require('path')
const { cwd } = require('process')

const test = require('ava')

const resolveConfig = require('../..')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')

test('Empty configuration', async t => {
  await runFixture(t, 'empty')
})

test('No --config but none found', async t => {
  await runFixture(t, 'none', { copyRoot: {} })
})

test('--config with an absolute path', async t => {
  await runFixture(t, '', { flags: { config: `${FIXTURES_DIR}/empty/netlify.toml` } })
})

test('--config with a relative path', async t => {
  await runFixture(t, '', { flags: { config: `${relative(cwd(), FIXTURES_DIR)}/empty/netlify.toml` } })
})

test('--config with an invalid relative path', async t => {
  await runFixture(t, '', { flags: { config: '/invalid' } })
})

test('--defaultConfig merge', async t => {
  const defaultConfig = JSON.stringify({ build: { publish: 'publish' } })
  await runFixture(t, 'default_merge', { flags: { defaultConfig } })
})

test('--defaultConfig priority', async t => {
  const defaultConfig = JSON.stringify({ build: { command: 'echo commandDefault' } })
  await runFixture(t, 'default_priority', { flags: { defaultConfig } })
})

test('--defaultConfig with an invalid relative path', async t => {
  await runFixture(t, '', { flags: { defaultConfig: '{{}' } })
})

test('--defaultConfig merges UI plugins with config plugins', async t => {
  const defaultConfig = JSON.stringify({ plugins: [{ package: 'one', inputs: { test: false, testThree: true } }] })
  await runFixture(t, 'plugins_merge', { flags: { defaultConfig } })
})

test('--cachedConfig', async t => {
  const { returnValue } = await runFixture(t, 'cached_config', { snapshot: false })
  await runFixture(t, 'cached_config', { flags: { cachedConfig: returnValue } })
})

test('--cachedConfig with an invalid path', async t => {
  await runFixture(t, '', { flags: { cachedConfig: '{{}' } })
})

test('--cachedConfig with a token', async t => {
  const { returnValue } = await runFixture(t, 'cached_config', { snapshot: false, flags: { token: 'test' } })
  await runFixture(t, 'cached_config', { flags: { cachedConfig: returnValue, token: 'test' } })
})

test('--cachedConfig with a siteId', async t => {
  const { returnValue } = await runFixture(t, 'cached_config', { snapshot: false, flags: { siteId: 'test' } })
  await runFixture(t, 'cached_config', { flags: { cachedConfig: returnValue, siteId: 'test' } })
})

test('Programmatic', async t => {
  const { config } = await resolveConfig({ repositoryRoot: `${FIXTURES_DIR}/empty` })
  t.not(config.build.environment, undefined)
})

test('Programmatic no options', async t => {
  const { config } = await resolveConfig()
  t.not(config.build.environment, undefined)
})
