import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

const CACHED_COMMAND = 'echo cached command'

const resolveWithModifiedCachedConfig = async (defaultConfig) => {
  const cachedConfig = await new Fixture(import.meta.url, './fixtures/cached_config').runWithConfigAsObject()
  const modifiedCachedConfig = {
    ...cachedConfig,
    config: { ...cachedConfig.config, build: { ...cachedConfig.config.build, command: CACHED_COMMAND } },
  }
  return await new Fixture(import.meta.url, './fixtures/cached_config')
    .withFlags({ cachedConfig: modifiedCachedConfig, defaultConfig })
    .runWithConfigAsObject()
}

test('A cached config without defaultConfig is returned as is', async () => {
  expect(await resolveWithModifiedCachedConfig(undefined)).toHaveProperty(
    ['config', 'build', 'command'],
    CACHED_COMMAND,
  )
})

test('A cached config with an empty defaultConfig is resolved again', async () => {
  expect(await resolveWithModifiedCachedConfig({})).toHaveProperty(['config', 'build', 'command'], 'echo command')
})

test('A cached config with a null defaultConfig is resolved again', async () => {
  // Current behaviour: only an undefined defaultConfig returns the cached config, so null counts as given.
  expect(await resolveWithModifiedCachedConfig(null)).toHaveProperty(['config', 'build', 'command'], 'echo command')
})
