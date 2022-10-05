import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'
import hasAnsi from 'has-ansi'

test('Prints some information in debug mode', async (t) => {
  const output = await new Fixture('./fixtures/simple').withFlags({ debug: true }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Allow printing undefined in debug mode', async (t) => {
  const output = await new Fixture('./fixtures/empty').withFlags({ debug: true }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Allow printing plugins with no inputs in debug mode', async (t) => {
  const output = await new Fixture('./fixtures/empty')
    .withFlags({ debug: true, defaultConfig: { plugins: [{ package: 'test' }] } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Does not print confidential information in debug mode', async (t) => {
  const output = await new Fixture('./fixtures/simple')
    .withFlags({
      debug: true,
      defaultConfig: { build: { environment: { SECRET: 'true' } } },
      inlineConfig: { build: { environment: { SECRET_TWO: 'true' } } },
    })
    .withEnv({ SECRET: 'true' })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Debug mode can be enabled using the NETLIFY_BUILD_DEBUG environment variable', async (t) => {
  const output = await new Fixture('./fixtures/simple').withEnv({ NETLIFY_BUILD_DEBUG: 'true' }).runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Debug mode can be enabled using the NETLIFY_BUILD_DEBUG environment UI setting', async (t) => {
  const output = await new Fixture('./fixtures/simple')
    .withFlags({
      defaultConfig: { build: { environment: { NETLIFY_BUILD_DEBUG: 'true' } } },
    })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Prints colors', async (t) => {
  const {
    logs: { stderr },
  } = await new Fixture('./fixtures/simple')
    .withFlags({ debug: true })
    .withEnv({ FORCE_COLOR: '1' })
    .runConfigBinaryAsObject()

  t.true(hasAnsi(stderr.join('\n')))
})
