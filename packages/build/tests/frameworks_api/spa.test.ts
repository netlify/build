import { Fixture } from '@netlify/testing'
import { expect, test } from 'vitest'

test('Honors `build.spa` declared through the Frameworks API config file', async () => {
  const { netlifyConfig, success } = await new Fixture(
    import.meta.url,
    './fixtures/spa_config',
  ).runWithBuildAndIntrospect()

  expect(success).toBe(true)
  expect(netlifyConfig.build.spa).toBe(true)
})
