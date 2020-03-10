const test = require('ava')

const { runFixtureConfig, getJsonOpt } = require('../helpers/main')

test('Base from defaultConfig', async t => {
  const defaultConfig = getJsonOpt({ build: { base: 'base' } })
  await runFixtureConfig(t, 'default_config', { flags: `--defaultConfig=${defaultConfig}` })
})

test('Base from configuration file property', async t => {
  await runFixtureConfig(t, 'prop_config')
})

test('Base logic is not recursive', async t => {
  await runFixtureConfig(t, 'recursive')
})

test('BaseRelDir feature flag', async t => {
  await runFixtureConfig(t, 'prop_config', { flags: `--no-baseRelDir` })
})
