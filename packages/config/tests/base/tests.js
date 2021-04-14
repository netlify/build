'use strict'

const test = require('ava')

const { runFixture } = require('../helpers/main')

test('Base from defaultConfig', async (t) => {
  const defaultConfig = { build: { base: 'base' } }
  await runFixture(t, 'default_config', { flags: { defaultConfig } })
})

test('Base from configuration file property', async (t) => {
  const { returnValue } = await runFixture(t, 'prop_config')
  const {
    buildDir,
    config: {
      build: { base, edge_handlers: edgeHandlers, publish },
      functionsDirectory,
    },
  } = JSON.parse(returnValue)
  t.is(base, buildDir)
  t.true(functionsDirectory.startsWith(buildDir))
  t.true(edgeHandlers.startsWith(buildDir))
  t.true(publish.startsWith(buildDir))
})

test('Base logic is not recursive', async (t) => {
  await runFixture(t, 'recursive')
})

test('BaseRelDir feature flag', async (t) => {
  const { returnValue } = await runFixture(t, 'prop_config', { flags: { baseRelDir: false } })
  const {
    buildDir,
    config: {
      build: { base, edge_handlers: edgeHandlers, publish },
      functionsDirectory,
    },
  } = JSON.parse(returnValue)
  t.is(base, buildDir)
  t.false(functionsDirectory.startsWith(buildDir))
  t.false(edgeHandlers.startsWith(buildDir))
  t.false(publish.startsWith(buildDir))
})

test('Base directory does not exist', async (t) => {
  await runFixture(t, 'base_invalid')
})
