import { Fixture, normalizeOutput } from '@netlify/testing'
import hasAnsi from 'has-ansi'
import { expect, test } from 'vitest'

test('Prints some information in debug mode', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/simple').withFlags({ debug: true }).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Allow printing undefined in debug mode', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty').withFlags({ debug: true }).runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Allow printing plugins with no inputs in debug mode', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/empty')
    .withFlags({ debug: true, defaultConfig: { plugins: [{ package: 'test' }] } })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Does not print confidential information in debug mode', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/simple')
    .withFlags({
      debug: true,
      defaultConfig: { build: { environment: { SECRET: 'true' } } },
      inlineConfig: { build: { environment: { SECRET_TWO: 'true' } } },
    })
    .withEnv({ SECRET: 'true' })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Debug mode can be enabled using the NETLIFY_BUILD_DEBUG environment variable', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/simple')
    .withEnv({ NETLIFY_BUILD_DEBUG: 'true' })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Debug mode can be enabled using the NETLIFY_BUILD_DEBUG environment UI setting', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/simple')
    .withFlags({
      defaultConfig: { build: { environment: { NETLIFY_BUILD_DEBUG: 'true' } } },
    })
    .runWithConfig()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('Prints colors', async () => {
  const {
    logs: { stderr },
  } = await new Fixture(import.meta.url, './fixtures/simple')
    .withFlags({ debug: true })
    .withEnv({ FORCE_COLOR: '1' })
    .runConfigBinaryAsObject()

  expect(hasAnsi(stderr.join('\n'))).toBe(true)
})
