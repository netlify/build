import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

test('Honors `spa_fallback` declared through the Frameworks API config file', async () => {
  const { netlifyConfig, success } = await new Fixture(
    import.meta.url,
    './fixtures/spa_fallback_config',
  ).runWithBuildAndIntrospect()

  expect(success).toBe(true)
  expect(netlifyConfig.spa_fallback).toBe(true)
})

test('`netlify.toml` takes precedence over the Frameworks API for `spa_fallback`', async () => {
  const { netlifyConfig, success } = await new Fixture(
    import.meta.url,
    './fixtures/spa_fallback_config_precedence',
  ).runWithBuildAndIntrospect()

  expect(success).toBe(true)
  expect(netlifyConfig.spa_fallback).toBe(false)
})
