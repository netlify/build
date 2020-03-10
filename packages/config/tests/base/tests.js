const test = require('ava')

const { runFixtureConfig, FIXTURES_DIR } = require('../helpers/main')

test('Base from defaultConfig', async t => {
  await runFixtureConfig(t, 'default_config', { flags: `--defaultConfig=${FIXTURES_DIR}/default_config/default.yml` })
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
