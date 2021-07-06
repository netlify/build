'use strict'

const { unlink, writeFile } = require('fs')
const { relative } = require('path')
const { cwd } = require('process')
const { promisify } = require('util')

const test = require('ava')
const { tmpName } = require('tmp-promise')

const resolveConfig = require('../..')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')

const pWriteFile = promisify(writeFile)
const pUnlink = promisify(unlink)

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
  const inlineConfig = { build: { command: undefined, publish: undefined } }
  await runFixture(t, 'default_priority', { flags: { inlineConfig } })
})

test('--inlineConfig can override the "base"', async (t) => {
  const defaultConfig = { build: { base: 'defaultBase' } }
  const inlineConfig = { build: { base: 'base' } }
  await runFixture(t, 'merge_base', { flags: { defaultConfig, inlineConfig } })
})

test('--inlineConfig cannot use contexts', async (t) => {
  const inlineConfig = { context: { testContext: { build: { command: 'echo commandPriority' } } } }
  await runFixture(t, 'default_priority', { flags: { context: 'testContext', inlineConfig } })
})

test('--inlineConfig cannot be overridden by contexts', async (t) => {
  const defaultConfig = { context: { testContext: { build: { command: 'echo commandDefault' } } } }
  const inlineConfig = { build: { command: 'echo commandPriority' } }
  await runFixture(t, 'default_priority', { flags: { context: 'testContext', defaultConfig, inlineConfig } })
})

test('--configMutations can override properties', async (t) => {
  await runFixture(t, 'default_priority', {
    flags: { configMutations: [{ keys: ['build', 'command'], value: 'testMutation', event: 'onPreBuild' }] },
  })
})

test('--configMutations cannot be overridden by contexts', async (t) => {
  const defaultConfig = { context: { testContext: { build: { command: 'echo commandDefault' } } } }
  await runFixture(t, 'default_priority', {
    flags: {
      defaultConfig,
      configMutations: [{ keys: ['build', 'command'], value: 'testMutation', event: 'onPreBuild' }],
    },
  })
})

test('--configMutations events are validated', async (t) => {
  await runFixture(t, 'default_priority', {
    flags: { configMutations: [{ keys: ['build', 'command'], value: 'testMutation', event: 'onBuild' }] },
  })
})

test('--configMutations cannot be applied on readonly properties', async (t) => {
  await runFixture(t, 'empty', {
    flags: { configMutations: [{ keys: ['build', 'base'], value: 'testMutation', event: 'onPreBuild' }] },
  })
})

test('--configMutations can mutate functions top-level properties', async (t) => {
  await runFixture(t, 'empty', {
    flags: { configMutations: [{ keys: ['functions', 'directory'], value: 'testMutation', event: 'onPreBuild' }] },
  })
})

test('--cachedConfig CLI flags', async (t) => {
  const { returnValue } = await runFixture(t, 'cached_config', { snapshot: false })
  await runFixture(t, 'cached_config', { flags: { cachedConfig: returnValue }, useBinary: true })
})

test('--cachedConfigPath CLI flag', async (t) => {
  const cachedConfigPath = await tmpName()
  try {
    await runFixture(t, 'cached_config', { flags: { output: cachedConfigPath }, snapshot: false, useBinary: true })
    await runFixture(t, 'cached_config', { flags: { cachedConfigPath, context: 'test' }, useBinary: true })
  } finally {
    await pUnlink(cachedConfigPath)
  }
})

test('--cachedConfig', async (t) => {
  const { returnValue } = await runFixture(t, 'cached_config', { snapshot: false })
  const cachedConfig = JSON.parse(returnValue)
  await runFixture(t, 'cached_config', { flags: { cachedConfig } })
})

test('--cachedConfigPath', async (t) => {
  const cachedConfigPath = await tmpName()
  try {
    const { returnValue } = await runFixture(t, 'cached_config', { snapshot: false })
    await pWriteFile(cachedConfigPath, returnValue)
    await runFixture(t, 'cached_config', { flags: { cachedConfigPath, context: 'test' } })
  } finally {
    await pUnlink(cachedConfigPath)
  }
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

test('featureFlags can be not used', async (t) => {
  await runFixture(t, 'empty', { flags: { featureFlags: undefined, debug: true } })
})
