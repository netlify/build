import { resolveConfig } from '@netlify/config'
import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

const resolveFixture = (fixtureName: string, flags: Record<string, unknown> = {}) =>
  resolveConfig(new Fixture(import.meta.url, `./fixtures/${fixtureName}`).withFlags(flags).getConfigFlags())

test('build.publishOrigin is "default" when no source sets build.publish', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `resolveConfig`'s result is untyped until its rewrite
  const { config } = await resolveFixture('empty')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- `resolveConfig`'s result is untyped until its rewrite
  expect(config.build.publishOrigin).toBe('default')
})

test('functions["*"] exists when nothing configures functions', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `resolveConfig`'s result is untyped until its rewrite
  const { config } = await resolveFixture('empty')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- `resolveConfig`'s result is untyped until its rewrite
  expect(config.functions['*']).toEqual({})
})

test('build.environment is an object, and headers and redirects are arrays, when nothing sets them', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `resolveConfig`'s result is untyped until its rewrite
  const { config } = await resolveFixture('empty')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- `resolveConfig`'s result is untyped until its rewrite
  expect(config.build.environment).toEqual({})
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- `resolveConfig`'s result is untyped until its rewrite
  expect(config.headers).toEqual([])
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- `resolveConfig`'s result is untyped until its rewrite
  expect(config.redirects).toEqual([])
})

test('Every plugin has an origin and inputs', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `resolveConfig`'s result is untyped until its rewrite
  const { config } = await resolveFixture('merge_netlify_toml_default', {
    defaultConfig: { plugins: [{ package: 'ui-plugin' }] },
    inlineConfig: { plugins: [{ package: 'inline-plugin' }] },
  })
  // @ts-expect-error: `resolveConfig`'s result is untyped until its rewrite
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment -- `resolveConfig`'s result is untyped until its rewrite
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- `resolveConfig`'s result is untyped until its rewrite
      const { command, commandOrigin } = (await result).config.build
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `resolveConfig`'s result is untyped until its rewrite
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
