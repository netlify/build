import { promises as fs } from 'fs'
import { relative } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import { tmpName } from 'tmp-promise'
import { expect, test } from 'vitest'

import { resolveConfig } from '../../lib/main.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('Empty configuration', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty').runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('No --config but none found', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/none')
    .withCopyRoot()
    .then((fixture) => fixture.runWithConfig())
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--config with an absolute path', async () => {
  const output = await new Fixture().withFlags({ config: `${FIXTURES_DIR}/empty/netlify.toml` }).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--config with a relative path', async () => {
  const output = await new Fixture()
    .withFlags({ config: `${relative(cwd(), FIXTURES_DIR)}/empty/netlify.toml` })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--config with an invalid relative path', async () => {
  const output = await new Fixture().withFlags({ config: '/invalid' }).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--defaultConfig CLI flag', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/default_merge')
    .withFlags({ defaultConfig: JSON.stringify({ build: { publish: 'publish' } }) })
    .runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--defaultConfig merge', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_merge')
    .withFlags({ defaultConfig: { build: { publish: 'publish' } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--defaultConfig priority', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_priority')
    .withFlags({ defaultConfig: { build: { command: 'echo commandDefault' } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--defaultConfig merges UI plugins with config plugins', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plugins_merge')
    .withFlags({ defaultConfig: { plugins: [{ package: 'one', inputs: { test: false, testThree: true } }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--defaultConfig can specify pinned versions', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ defaultConfig: { plugins: [{ package: 'one', pinned_version: '1' }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--defaultConfig ignores pinned versions that are empty strings', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ defaultConfig: { plugins: [{ package: 'one', pinned_version: '' }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--inlineConfig CLI flag', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/default_merge')
    .withFlags({ inlineConfig: JSON.stringify({ build: { publish: 'publish' } }) })
    .runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--inlineConfig is merged', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_merge')
    .withFlags({ inlineConfig: { build: { publish: 'publish' } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--inlineConfig is merged with priority', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_priority')
    .withFlags({ inlineConfig: { build: { command: 'echo commandInline' } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--inlineConfig falsy values are ignored', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_priority')
    .withFlags({ inlineConfig: { build: { command: undefined, publish: undefined } } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--inlineConfig can override the "base"', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/merge_base')
    .withFlags({
      defaultConfig: { build: { base: 'defaultBase' } },
      inlineConfig: { build: { base: 'base' } },
    })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--inlineConfig cannot use contexts', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_priority')
    .withFlags({
      context: 'testContext',
      inlineConfig: { context: { testContext: { build: { command: 'echo commandPriority' } } } },
    })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--inlineConfig cannot be overridden by contexts', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_priority')
    .withFlags({
      context: 'testContext',
      defaultConfig: { context: { testContext: { build: { command: 'echo commandDefault' } } } },
      inlineConfig: { build: { command: 'echo commandPriority' } },
    })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--configMutations can override properties', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_priority')
    .withFlags({ configMutations: [{ keys: ['build', 'command'], value: 'testMutation', event: 'onPreBuild' }] })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--configMutations cannot be overridden by contexts', async () => {
  const defaultConfig = { context: { testContext: { build: { command: 'echo commandDefault' } } } }
  const output = await new Fixture(import.meta.url, './fixtures/default_priority')
    .withFlags({
      defaultConfig,
      configMutations: [{ keys: ['build', 'command'], value: 'testMutation', event: 'onPreBuild' }],
    })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--configMutations events are validated', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default_priority')
    .withFlags({ configMutations: [{ keys: ['build', 'command'], value: 'testMutation', event: 'onBuild' }] })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--configMutations cannot be applied on readonly properties', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ configMutations: [{ keys: ['build', 'base'], value: 'testMutation', event: 'onPreBuild' }] })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--configMutations can mutate functions top-level properties', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ configMutations: [{ keys: ['functions', 'directory'], value: 'testMutation', event: 'onPreBuild' }] })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--cachedConfig CLI flags', async () => {
  const returnValue = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfig()
  const { output } = await new Fixture(import.meta.url, './fixtures/default_merge')
    .withFlags({ cachedConfig: returnValue })
    .runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--cachedConfigPath CLI flag', async () => {
  const cachedConfigPath = await tmpName()
  try {
    await new Fixture(import.meta.url, './fixtures/cached_config')
      .withFlags({ output: cachedConfigPath })
      .runConfigBinary()
    const { output } = await new Fixture(import.meta.url, './fixtures/cached_config')
      .withFlags({ cachedConfigPath, context: 'test' })
      .runConfigBinary()
    const { config } = JSON.parse(output)
    expect(config.build.command).toBe('echo command')
  } finally {
    await fs.unlink(cachedConfigPath)
  }
})

test('--cachedConfig', async () => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfigAsObject()
  const output = await new Fixture(import.meta.url, './fixtures/cached_config')
    .withFlags({ cachedConfig })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--cachedConfigPath', async () => {
  const cachedConfigPath = await tmpName()
  try {
    const returnValue = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfig()
    await fs.writeFile(cachedConfigPath, returnValue)

    const output = await new Fixture(import.meta.url, './fixtures/cached_config')
      .withFlags({ cachedConfigPath, context: 'test' })
      .runWithConfig()
    expect(normalizeOutput(output)).toMatchSnapshot()
  } finally {
    await fs.unlink(cachedConfigPath)
  }
})

test('--cachedConfig with a token', async () => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfigAsObject()

  const output = await new Fixture(import.meta.url, './fixtures/cached_config')
    .withFlags({ cachedConfig, token: 'test' })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('--cachedConfig with a siteId', async () => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config')
    .withFlags({ siteId: 'test' })
    .runWithConfigAsObject()

  const output = await new Fixture(import.meta.url, './fixtures/cached_config')
    .withFlags({ cachedConfig, siteId: 'test' })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Programmatic', async () => {
  const { config } = await resolveConfig({ repositoryRoot: `${FIXTURES_DIR}/empty` })
  expect(config.build.environment).not.toBeUndefined()
})

test('Programmatic no options', async () => {
  const { config } = await resolveConfig()
  expect(config.build.environment).not.toBeUndefined()
})

test('featureFlags can be used programmatically', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ featureFlags: { test: true, testTwo: false } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('featureFlags can be used in the CLI', async () => {
  const { output } = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ featureFlags: { test: true, testTwo: false } })
    .runConfigBinary()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('featureFlags can be not used', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ featureFlags: undefined, debug: true })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
