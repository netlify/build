const test = require('ava')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('Base from defaultConfig', async t => {
  await runFixture(t, 'default_config', { flags: `--defaultConfig=${FIXTURES_DIR}/default_config/default.yml` })
})

test('Base from configuration file property', async t => {
  await runFixture(t, 'prop_config')
})

test('Base logic is not recursive', async t => {
  await runFixture(t, 'recursive')
})
