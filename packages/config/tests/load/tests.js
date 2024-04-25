import { promises as fs } from 'fs'
import { relative } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'
import { tmpName } from 'tmp-promise'

import { resolveConfig } from '../../lib/main.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

test('Empty configuration', async (t) => {
  const output = await new Fixture('./fixtures/empty').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('No --config but none found', async (t) => {
  const output = await new Fixture('./fixtures/none').withCopyRoot().then((fixture) => fixture.runWithConfig())
  t.snapshot(normalizeOutput(output))
})

test('--config with an absolute path', async (t) => {
  const output = await new Fixture().withFlags({ config: `${FIXTURES_DIR}/empty/netlify.toml` }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--config with a relative path', async (t) => {
  const output = await new Fixture()
    .withFlags({ config: `${relative(cwd(), FIXTURES_DIR)}/empty/netlify.toml` })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--config with an invalid relative path', async (t) => {
  const output = await new Fixture().withFlags({ config: '/invalid' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--defaultConfig CLI flag', async (t) => {
  const { output } = await new Fixture('./fixtures/default_merge')
    .withFlags({ defaultConfig: JSON.stringify({ build: { publish: 'publish' } }) })
    .runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('--defaultConfig merge', async (t) => {
  const output = await new Fixture('./fixtures/default_merge')
    .withFlags({ defaultConfig: { build: { publish: 'publish' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--defaultConfig priority', async (t) => {
  const output = await new Fixture('./fixtures/default_priority')
    .withFlags({ defaultConfig: { build: { command: 'echo commandDefault' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--defaultConfig merges UI plugins with config plugins', async (t) => {
  const output = await new Fixture('./fixtures/plugins_merge')
    .withFlags({ defaultConfig: { plugins: [{ package: 'one', inputs: { test: false, testThree: true } }] } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--defaultConfig can specify pinned versions', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ defaultConfig: { plugins: [{ package: 'one', pinned_version: '1' }] } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--defaultConfig ignores pinned versions that are empty strings', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ defaultConfig: { plugins: [{ package: 'one', pinned_version: '' }] } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--inlineConfig CLI flag', async (t) => {
  const { output } = await new Fixture('./fixtures/default_merge')
    .withFlags({ inlineConfig: JSON.stringify({ build: { publish: 'publish' } }) })
    .runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('--inlineConfig is merged', async (t) => {
  const output = await new Fixture('./fixtures/default_merge')
    .withFlags({ inlineConfig: { build: { publish: 'publish' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--inlineConfig is merged with priority', async (t) => {
  const output = await new Fixture('./fixtures/default_priority')
    .withFlags({ inlineConfig: { build: { command: 'echo commandInline' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--inlineConfig falsy values are ignored', async (t) => {
  const output = await new Fixture('./fixtures/default_priority')
    .withFlags({ inlineConfig: { build: { command: undefined, publish: undefined } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--inlineConfig can override the "base"', async (t) => {
  const output = await new Fixture('./fixtures/merge_base')
    .withFlags({
      defaultConfig: { build: { base: 'defaultBase' } },
      inlineConfig: { build: { base: 'base' } },
    })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--inlineConfig cannot use contexts', async (t) => {
  const output = await new Fixture('./fixtures/default_priority')
    .withFlags({
      context: 'testContext',
      inlineConfig: { context: { testContext: { build: { command: 'echo commandPriority' } } } },
    })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--inlineConfig cannot be overridden by contexts', async (t) => {
  const output = await new Fixture('./fixtures/default_priority')
    .withFlags({
      context: 'testContext',
      defaultConfig: { context: { testContext: { build: { command: 'echo commandDefault' } } } },
      inlineConfig: { build: { command: 'echo commandPriority' } },
    })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--configMutations can override properties', async (t) => {
  const output = await new Fixture('./fixtures/default_priority')
    .withFlags({ configMutations: [{ keys: ['build', 'command'], value: 'testMutation', event: 'onPreBuild' }] })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--configMutations cannot be overridden by contexts', async (t) => {
  const defaultConfig = { context: { testContext: { build: { command: 'echo commandDefault' } } } }
  const output = await new Fixture('./fixtures/default_priority')
    .withFlags({
      defaultConfig,
      configMutations: [{ keys: ['build', 'command'], value: 'testMutation', event: 'onPreBuild' }],
    })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--configMutations events are validated', async (t) => {
  const output = await new Fixture('./fixtures/default_priority')
    .withFlags({ configMutations: [{ keys: ['build', 'command'], value: 'testMutation', event: 'onBuild' }] })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--configMutations cannot be applied on readonly properties', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ configMutations: [{ keys: ['build', 'base'], value: 'testMutation', event: 'onPreBuild' }] })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--configMutations can mutate functions top-level properties', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ configMutations: [{ keys: ['functions', 'directory'], value: 'testMutation', event: 'onPreBuild' }] })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--cachedConfig CLI flags', async (t) => {
  const returnValue = await new Fixture('./fixtures/cached_config').runWithConfig()
  const { output } = await new Fixture('./fixtures/default_merge')
    .withFlags({ cachedConfig: returnValue })
    .runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('--cachedConfigPath CLI flag', async (t) => {
  const cachedConfigPath = await tmpName()
  try {
    await new Fixture('./fixtures/cached_config').withFlags({ output: cachedConfigPath }).runConfigBinary()
    await new Fixture('./fixtures/cached_config').withFlags({ cachedConfigPath, context: 'test' }).runConfigBinary()
    t.pass()
  } finally {
    await fs.unlink(cachedConfigPath)
  }
})

test('--cachedConfig', async (t) => {
  const cachedConfig = await new Fixture('./fixtures/cached_config').runWithConfigAsObject()
  const output = await new Fixture('./fixtures/cached_config').withFlags({ cachedConfig }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--cachedConfigPath', async (t) => {
  const cachedConfigPath = await tmpName()
  try {
    const returnValue = await new Fixture('./fixtures/cached_config').runWithConfig()
    await fs.writeFile(cachedConfigPath, returnValue)

    const output = await new Fixture('./fixtures/cached_config')
      .withFlags({ cachedConfigPath, context: 'test' })
      .runWithConfig()
    t.snapshot(normalizeOutput(output))
  } finally {
    await fs.unlink(cachedConfigPath)
  }
})

test('--cachedConfig with a token', async (t) => {
  const cachedConfig = await new Fixture('./fixtures/cached_config').runWithConfigAsObject()

  const output = await new Fixture('./fixtures/cached_config')
    .withFlags({ cachedConfig, token: 'test' })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('--cachedConfig with a siteId', async (t) => {
  const cachedConfig = await new Fixture('./fixtures/cached_config')
    .withFlags({ siteId: 'test' })
    .runWithConfigAsObject()

  const output = await new Fixture('./fixtures/cached_config')
    .withFlags({ cachedConfig, siteId: 'test' })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
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
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ featureFlags: { test: true, testTwo: false } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('featureFlags can be used in the CLI', async (t) => {
  const { output } = await new Fixture('./fixtures/empty')
    .withFlags({ featureFlags: { test: true, testTwo: false } })
    .runConfigBinary()
  t.snapshot(normalizeOutput(output))
})

test('featureFlags can be not used', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ featureFlags: undefined, debug: true })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})
