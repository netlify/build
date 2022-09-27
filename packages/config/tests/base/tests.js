import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('Base from defaultConfig', async (t) => {
  const output = await new Fixture('./fixtures/default_config')
    .withFlags({ defaultConfig: { build: { base: 'base' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Base from configuration file property', async (t) => {
  const output = await new Fixture('./fixtures/prop_config').runWithConfig()
  t.snapshot(normalizeOutput(output))
  const {
    buildDir,
    config: {
      build: { base, edge_functions: edgeFunctions, publish },
      functionsDirectory,
    },
  } = JSON.parse(output)
  t.is(base, buildDir)
  t.true(functionsDirectory.startsWith(buildDir))
  t.true(edgeFunctions.startsWith(buildDir))
  t.true(publish.startsWith(buildDir))
})

test('Base logic is not recursive', async (t) => {
  const output = await new Fixture('./fixtures/recursive').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('BaseRelDir feature flag', async (t) => {
  const output = await new Fixture('./fixtures/prop_config').withFlags({ baseRelDir: false }).runWithConfig()
  t.snapshot(normalizeOutput(output))
  const {
    buildDir,
    config: {
      build: { base, edge_functions: edgeFunctions, publish },
      functionsDirectory,
    },
  } = JSON.parse(output)
  t.is(base, buildDir)

  t.false(functionsDirectory.startsWith(buildDir))
  t.false(edgeFunctions.startsWith(buildDir))
  t.false(publish.startsWith(buildDir))
})

test('Base directory does not exist', async (t) => {
  const output = await new Fixture('./fixtures/base_invalid').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Use "base" as default value for "publish"', async (t) => {
  const output = await new Fixture('./fixtures/base_without_publish').runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Use "base" as "publish" when it is an empty string', async (t) => {
  const output = await new Fixture('./fixtures/base_without_publish')
    .withFlags({ defaultConfig: { build: { publish: '' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})

test('Use "base" as "publish" when it is /', async (t) => {
  const output = await new Fixture('./fixtures/base_without_publish')
    .withFlags({ defaultConfig: { build: { publish: '/' } } })
    .runWithConfig()
  t.snapshot(normalizeOutput(output))
})
