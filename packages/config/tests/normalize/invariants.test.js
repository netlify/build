import { resolveConfig } from '@netlify/config'
import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

const resolveFixture = (fixtureName, flags = {}) =>
  resolveConfig(new Fixture(import.meta.url, `./fixtures/${fixtureName}`).withFlags(flags).getConfigFlags())

test('build.publishOrigin is "default" when no source sets build.publish', async () => {
  const { config } = await resolveFixture('empty')
  expect(config.build.publishOrigin).toBe('default')
})

test('functions["*"] exists when nothing configures functions', async () => {
  const { config } = await resolveFixture('empty')
  expect(config.functions['*']).toEqual({})
})

test('build.environment is an object, and headers and redirects are arrays, when nothing sets them', async () => {
  const { config } = await resolveFixture('empty')
  expect(config.build.environment).toEqual({})
  expect(config.headers).toEqual([])
  expect(config.redirects).toEqual([])
})

test('Every plugin has an origin and inputs', async () => {
  const { config } = await resolveFixture('merge_netlify_toml_default', {
    defaultConfig: { plugins: [{ package: 'ui-plugin' }] },
    inlineConfig: { plugins: [{ package: 'inline-plugin' }] },
  })
  expect(config.plugins.map(({ package: packageName, origin, inputs }) => ({ packageName, origin, inputs }))).toEqual([
    { packageName: 'ui-plugin', origin: 'ui', inputs: {} },
    { packageName: 'netlify-plugin-test-two', origin: 'config', inputs: { boolean: true } },
    {
      packageName: 'netlify-plugin-test',
      origin: 'config',
      inputs: { boolean: false, array: ['c', 'd'], object: { prop: false } },
    },
    { packageName: 'inline-plugin', origin: 'inline', inputs: {} },
  ])
})

test('build.commandOrigin is set whenever build.command is', async () => {
  const origins = await Promise.all(
    [
      resolveFixture('command_origin_config'),
      resolveFixture('command_origin_context'),
      resolveFixture('empty', { defaultConfig: { build: { command: 'ui' } } }),
      resolveFixture('empty', { inlineConfig: { build: { command: 'inline' } } }),
      resolveFixture('empty', {
        configMutations: [{ keys: ['build', 'command'], value: 'mutation', event: 'onPreBuild' }],
      }),
    ].map(async (result) => {
      const { command, commandOrigin } = (await result).config.build
      return { command, commandOrigin }
    }),
  )
  expect(origins).toEqual([
    { command: 'test', commandOrigin: 'config' },
    { command: 'test', commandOrigin: 'config' },
    { command: 'ui', commandOrigin: 'ui' },
    { command: 'inline', commandOrigin: 'inline' },
    // Current behaviour: mutations are applied to the inline config, so they share its origin.
    { command: 'mutation', commandOrigin: 'inline' },
  ])
})
